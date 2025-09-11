import { auth } from "@/auth";
import prisma  from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/redis";

export async function POST(req: Request) {
  const userSession = await auth();

  if (!userSession?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";

  const { ok, remaining, reset } = await rateLimit(
    `api:get-conversations:${ip}`,
    10,       // max 10 requests
    60_000    // per 1 minute
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
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { conversationId, title, messages } = await req.json();

  let conversation;

  if (!conversationId) {
    // Create new conversation
    conversation = await prisma.chatConversation.create({
      data: {
        userId: user.id,
        title: title || "New Chat",
        messages: {
          create: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
        },
      },
      include: {
        messages: true,
      },
    });
  } else {
    const existingConv = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    });

    if (!existingConv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Append to existing conversation
    conversation = await prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        title: title || "New Chat",
        messages: {
          create: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
        },
      },
      include: {
        messages: true,
      },
    });
  }

  return NextResponse.json({ success: true, conversation });
}

