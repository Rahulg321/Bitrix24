import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/redis";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const userSession = await auth();

  if (!userSession?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";

  const { ok, remaining, reset } = await rateLimit(`api:chat-post:${ip}`, 10, 60_000);

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

  // --- Fetch prior messages from DB
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

  // --- Set up SDK and stream
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const encoder = new TextEncoder();

  const stream = await model.generateContentStream({
    contents: promptMessages.map((msg) => ({
      role: msg.author,
      parts: [{ text: msg.content }],
    })),
  });

  // Buffer for final message storage
  let fullResponse = "";
  const now = new Date();
  const streamOut = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream.stream) {
          const text = chunk.text();
          fullResponse += text;
          controller.enqueue(encoder.encode(text));
        }
        controller.close();

        // Save to DB (non-blocking)
        const userMessageData = {
          role: "user",
          content: userMessage,
          createdAt: now,
        };

        const assistantMessageData = {
          role: "assistant",
          content: fullResponse,
          createdAt: new Date(now.getTime() + 1),
        };

        (async () => {
          try {
            if (!conversationId) {
              await prisma.chatConversation.create({
                data: {
                  userId: user.id,
                  title: "New Chat",
                  messages: {
                    create: [userMessageData, assistantMessageData],
                  },
                },
              });
            } else {
              await prisma.chatConversation.update({
                where: { id: conversationId },
                data: {
                  messages: {
                    create: [userMessageData, assistantMessageData],
                  },
                },
              });
            }
          } catch (err) {
            console.error("❌ Failed to save messages to DB:", err);
          }
        })();
      } catch (err) {
        console.error("❌ Stream error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(streamOut, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
