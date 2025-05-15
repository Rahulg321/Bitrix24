import { NextResponse } from "next/server";
import { auth }         from "@/auth";
import { limiters, enforce } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const session = await auth();

  const key = session?.user?.id ?? req.headers.get("x-forwarded-for") ?? undefined;
  const { ok, headers } = await enforce(limiters.authSession, key);
  if (!ok) return new Response("Too many requests", { status: 429, headers });

  return NextResponse.json({ data: session ?? null }, { headers });
}
