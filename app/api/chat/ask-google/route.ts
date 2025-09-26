import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/redis";
import { executeDatabaseQuery } from "@/lib/ai/tools/chatbot-tools";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
  } catch (err) {
    console.error("Invalid request body:", err);
    return new Response("Invalid input", { status: 400 });
  }

  // Handle human confirmation request separately:
  if (humanConfirmation) {
    if (humanConfirmation.toolName === "databaseQueryTool" && humanConfirmation.confirmed) {
      try {
        const queryResult = await executeDatabaseQuery(humanConfirmation.input);

        // Format the results as a readable message
        let responseText = "";
        if (Array.isArray(queryResult) && queryResult.length > 0) {
          responseText = `Found ${queryResult.length} deal(s):\n\n`;
          queryResult.forEach((deal, index) => {
            responseText += `Deal ${index + 1}: ${deal.title}\n`;
            responseText += `- EBITDA: ${deal.ebitda?.toLocaleString() || 'N/A'}\n`;
            responseText += `- Revenue: ${deal.revenue?.toLocaleString() || 'N/A'}\n`;
            responseText += `- Location: ${deal.companyLocation || 'N/A'}\n`;
            responseText += `- EBITDA Margin: ${deal.ebitdaMargin ? parseFloat(deal.ebitdaMargin).toFixed(2) + '%' : 'N/A'}\n\n`;
          });
        } else {
          responseText = "No deals found matching your criteria.";
        }

        // Return JSON response with toolResults for chart rendering
        const responseData = {
          text: responseText,
          toolResults: [{ result: { deals: queryResult } }]
        };

        // Save messages to DB
        const now = new Date();
        const userMsg = { role: "user", content: "yes, run it", createdAt: now };
        const assistantMsg = { role: "assistant", content: responseText, createdAt: new Date(now.getTime() + 1) };

        // Save asynchronously
        if (conversationId) {
          prisma.chatConversation.update({
            where: { id: conversationId },
            data: {
              messages: {
                create: [userMsg, assistantMsg],
              },
            },
          }).catch(err => console.error("Failed to save messages:", err));
        }

        return new Response(JSON.stringify(responseData), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        });

      } catch (err) {
        console.error("Failed to execute DB query after human confirmation:", err);

        const errorStream = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode("Sorry, I encountered an error while executing the database query."));
            controller.close();
          },
        });

        return new Response(errorStream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      }
    } else {
      // Human rejected
      const rejectionStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("Understood, I will not execute the query."));
          controller.close();
        },
      });

      return new Response(rejectionStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
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


  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
    const systemMsg = promptMessages.find((m) => m.role === "system")?.content || "";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemMsg,
    });

    const promptText = promptMessages
      .filter(m => m.role !== "system")
      .map(m => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
      .join("\n\n");

    const response = await model.generateContentStream(promptText);

    let assistantMessageContent = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response.stream) {
            const textChunk = chunk.text();
            if (textChunk) {
              assistantMessageContent += textChunk;
              controller.enqueue(new TextEncoder().encode(textChunk));
            }
            
          }
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
