import { NextResponse } from "next/server";
import { withAuth }     from "@/lib/withAuth";
import { limiters, enforce } from "@/lib/rate-limit";
import { analyzeDeal }  from "@/lib/ai";

export const POST = withAuth(async (req, user) => {
  const { id } = await req.json();   // { id: "<deal-id>" }

  const { ok, headers } = await enforce(limiters.aiAnalyze, user.id);
  if (!ok) return new Response("Too many requests", { status: 429, headers });

  const result = await analyzeDeal(id);
  return NextResponse.json({ data: result }, { status: 200, headers });
}).__ratelimit("aiAnalyze");
