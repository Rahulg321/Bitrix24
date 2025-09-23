import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/redis";
import { tools, executeDatabaseQuery } from "@/lib/ai/tools/chatbot-tools";
import { streamText } from "ai";
import { getGoogleModel } from "@/lib/ai/available-models";
import type { ChatMessage } from '@prisma/client';
import type { ModelMessage } from "ai";
import { z } from "zod";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const userSession = await auth();
  if (!userSession?.user?.email) return new Response("Unauthorized", { status: 401 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const rateKey = `chat:${userSession.user.email ?? `ip:${ip}`}`;
  const { ok, remaining, reset } = await rateLimit(rateKey, 10, 60_000);

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

  const user = await prisma.user.findUnique({ where: { email: userSession.user.email } });
  if (!user) return new Response("User not found", { status: 404 });

  const requestSchema = z.object({
    conversationId: z.string().optional(),
    message: z.string().min(1).max(2000),
    humanConfirmation: z
      .object({
        toolName: z.string(),
        input: z.record(z.string(), z.any()),
        confirmed: z.boolean(),
      })
      .optional(),
  });

  let conversationId: string | undefined;
  let userMessage: string;
  let humanConfirmation: { toolName: string; input: Record<string, any>; confirmed: boolean } | undefined;

  try {
    const json = await req.json();
    const parsed = requestSchema.parse(json);
    conversationId = parsed.conversationId;
    userMessage = parsed.message;
    humanConfirmation = parsed.humanConfirmation;
    console.log(humanConfirmation)
  } catch (err) {
    console.error("Invalid request body:", err);
    return new Response("Invalid input", { status: 400 });
  }

  // Handle human confirmation request separately:
  if (humanConfirmation) {
    if (humanConfirmation.toolName === "databaseQueryTool" && humanConfirmation.confirmed) {
      // Human approved — execute the actual DB query and return results

      try {
        const queryResult = await executeDatabaseQuery(humanConfirmation.input);

        if(Array.isArray(queryResult) && queryResult.length > 0){
          console.log("One deal fetched:", queryResult[0]);
        } else {
          console.log("No deals found in query result.")
        }

        return new Response(JSON.stringify(queryResult), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.error("Failed to execute DB query after human confirmation:", err);
        return new Response("Failed to execute query", { status: 500 });
      }
    } else {
      // Human rejected or unknown tool
      return new Response(
        JSON.stringify({ success: false, message: "Tool execution cancelled by human." }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 🧠 Fetch prior conversation messages
  let previousMessages: ModelMessage[] = [];
  if (conversationId) {
    const convo = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!convo) return new Response("Conversation not found", { status: 404 });
    if (convo.userId !== user.id) return new Response("Forbidden", { status: 403 });

    previousMessages = convo.messages.map((msg: ChatMessage) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));
  }

  const promptMessages: ModelMessage[] = [
    {
      role: "system",
      content: `
      You are a helpful assistant.

      - If the user asks a general question, answer directly in natural language.
      - If the user requests information that requires a database search (e.g., deals with specific criteria), respond ONLY with a JSON object in this exact format:

      {
        "toolName": "databaseQueryTool",
        "input": {
          ... // filter criteria
        }
      }

      - Do NOT add any other text around the JSON.
      - Do NOT generate debug statements like "print(...)".
      - Wait for human confirmation before proceeding to run the tool.
      - When the user approves, execute the query and return the results in a clear format. Do not return debug statements like "print(...)".
      - If the user rejects, respond with "Understood, I will not execute the query."
      `
    },
    ...previousMessages,
    { role: "user", content: userMessage },
  ];

  // Debug: Log the messages being sent
  console.log("Messages being sent to AI:", JSON.stringify(promptMessages, null, 2));

  try {
    const result = await streamText({
      model: getGoogleModel("gemini-1.5-flash"),
      tools,
      messages: promptMessages,
    });

    const stream = result.textStream;
    if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') {
      console.error("Result is not async iterable");
      return new Response("Internal Server Error", { status: 500 });
    }

    let assistantMessageContent = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            assistantMessageContent += chunk;
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          console.log("Assistant response:", assistantMessageContent);
          controller.close();

          // Save user + assistant messages to DB asynchronously
          const now = new Date();
          const userMsg = { role: "user", content: userMessage, createdAt: now };
          const assistantMsg = { role: "assistant", content: assistantMessageContent, createdAt: new Date(now.getTime() + 1) };

          try {
            if (!conversationId) {
              await prisma.chatConversation.create({
                data: {
                  userId: user.id,
                  title: "New Chat",
                  messages: {
                    create: [userMsg, assistantMsg],
                  },
                },
              });
            } else {
              await prisma.chatConversation.update({
                where: { id: conversationId },
                data: {
                  messages: {
                    create: [userMsg, assistantMsg],
                  },
                },
              });
            }
          } catch (err) {
            console.error("Failed to save messages:", err);
          }
        } catch (err) {
          console.error("Streaming failed:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("AI error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
