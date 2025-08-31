import { NextResponse }          from "next/server";
import { sendReset }             from "@/lib/mailer";
import { limiters, enforce }     from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { email } = await req.json();

  const { ok, headers } = await enforce(limiters.authForgot, email);
  if (!ok) return new Response("Too many requests", { status: 429, headers });

  await sendReset(email);
  return NextResponse.json({ ok: true }, { status: 200, headers });
}
