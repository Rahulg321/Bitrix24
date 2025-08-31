import { NextResponse } from "next/server";
import prisma           from "@/lib/prisma";
import { withAuth }     from "@/lib/withAuth";
import { limiters, enforce } from "@/lib/rate-limit";


export const PATCH = withAuth(async (req, user) => {
  const { id } = (req as any).params as { id: string };
  const body = await req.json();

  const { ok, headers } = await enforce(limiters.dealsUpdate, user.id);
  if (!ok) return new Response("Too many requests", { status: 429, headers });

  const deal = await prisma.deal.update({ where: { id }, data: body });
  return NextResponse.json({ data: deal }, { headers });
}).__ratelimit("dealsUpdate");


export const DELETE = withAuth(async (req, user) => {
  const { id } = (req as any).params as { id: string };

  const { ok, headers } = await enforce(limiters.dealsDelete, user.id);
  if (!ok) return new Response("Too many requests", { status: 429, headers });

  await prisma.deal.delete({ where: { id } });
  return new Response(null, { status: 204, headers });
}).__ratelimit("dealsDelete");
