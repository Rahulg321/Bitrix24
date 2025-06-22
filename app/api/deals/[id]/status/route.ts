import { NextResponse }          from "next/server";
import prisma                    from "@/lib/prisma";
import { withAuth }              from "@/lib/withAuth";
import { limiters, enforce }     from "@/lib/rate-limit";

export const POST = withAuth(async (req, user) => {
  const { id } = (req as any).params as { id: string };
  const { status } = await req.json();        // { status: "OPEN" | … }

  const { ok, headers } = await enforce(limiters.dealsStatus, user.id);
  if (!ok) return new Response("Too many requests", { status: 429, headers });

  const deal = await prisma.deal.update({ where: { id }, data: { status } });
  return NextResponse.json({ data: deal }, { headers });
}).__ratelimit("dealsStatus");
