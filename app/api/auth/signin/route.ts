import { NextResponse } from "next/server";
import { signIn }       from "@/auth";
import { limiters, enforce } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  /* ─ rate-limit ─ */
  const { ok, headers } = await enforce(limiters.authSignin, email);
  if (!ok) return new Response("Too many sign-in attempts", { status: 429, headers });

  const session = await signIn(email, password);
  if (!session) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  return NextResponse.json({ data: session }, { status: 200, headers });
}
