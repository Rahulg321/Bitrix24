import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/redis";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const userSession = await auth();

  if (!userSession?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";

  const { ok, remaining, reset } = await rateLimit(
    `api:chat-post:${ip}`,
    10,      // 10 requests
    60_000   // per 60 seconds
  );

  if (!ok) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "RateLimit-Limit": "10",
        "RateLimit-Remaining": String(remaining),
        "RateLimit-Reset": String(Math.ceil((reset - Date.now()) / 1000)),
      },
    });
  }

  const user = await prisma.user.findUnique({
    where: { email: userSession.user.email },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const { conversationId, message: userMessage } = await req.json();

  if (!userMessage || userMessage.trim() === "") {
    return new Response("Message is required", { status: 400 });
  }

  const API_KEY = process.env.GOOGLE_AI_API_KEY;
  if (!API_KEY) {
    console.error("❌ Missing GOOGLE_AI_API_KEY");
    return new Response("Missing Google API key", { status: 500 });
  }

  // Fetch prior messages
  let previousMessages: { author: string; content: string }[] = [];

  if (conversationId) {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conversation) return new Response("Conversation not found", { status: 404 });
    if (conversation.userId !== user.id) return new Response("Forbidden", { status: 403 });

    previousMessages = conversation.messages.map(msg => ({
      author: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));
  }

  const promptMessages = [
    ...previousMessages,
    { author: "user", content: userMessage },
  ];

  // Call Gemini API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: promptMessages.map((msg) => ({
          role: msg.author === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      }),
    }
  );

  const raw = await response.text();

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error("❌ Invalid JSON from Gemini:", err);
    return new Response("Invalid response from Google AI", { status: 500 });
  }

  const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!aiReply) {
    return new Response("No valid AI response", { status: 500 });
  }

  // Save messages in the DB in parallel (non-blocking)
  const now = new Date();
  const aiMessageData = {
    role: "assistant",
    content: aiReply,
    createdAt: new Date(now.getTime() + 1),
  };

  const userMessageData = {
    role: "user",
    content: userMessage,
    createdAt: now,
  };

  (async () => {
    try {
      if (!conversationId) {
        await prisma.chatConversation.create({
          data: {
            userId: user.id,
            title: "New Chat",
            messages: {
              create: [userMessageData, aiMessageData],
            },
          },
        });
      } else {
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: {
            messages: {
              create: [userMessageData, aiMessageData],
            },
          },
        });
      }
    } catch (err) {
      console.error("❌ Failed to save messages to DB:", err);
    }
  })();

  // ✅ Simulate streaming the text word-by-word
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const words = aiReply.split(" ");
      let i = 0;

      function pushWord() {
        if (i >= words.length) {
          controller.close();
          return;
        }
        const word = words[i++];
        controller.enqueue(encoder.encode(word + " "));
        setTimeout(pushWord, 40); // simulate delay
      }

      pushWord();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
