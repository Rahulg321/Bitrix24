import { NextResponse } from "next/server";

type InMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const messages: InMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    const content = lastUser?.content?.trim() || "";
    const reply = content
      ? `You said: ${content}`
      : "Hello! Ask me anything.";
    return NextResponse.json({ message: reply });
  } catch (e) {
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
