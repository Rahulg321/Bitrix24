import { auth } from "@/auth";
import prisma from "@/lib/prisma";
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

  const { conversationId, title } = await req.json();

  if (!conversationId || typeof title !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Verify user owns the conversation before updating
  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  if (conversation.userId !== userSession.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Update the title
  const updatedConversation = await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { title },
  });

  return NextResponse.json({ conversation: updatedConversation });
}
