import { NextResponse }          from "next/server";
import prisma                    from "@/lib/prisma";
import { withAuth }              from "@/lib/withAuth";
import { limiters, enforce }     from "@/lib/rate-limit"; 


async function listDeals() {
  const deals = await prisma.deal.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ data: deals });
}
export const GET = withAuth(listDeals).__ratelimit("dealsRead");

export const POST = withAuth(async (req, user) => {
  const values = await req.json();

  const { ok, headers } = await enforce(limiters.dealsCreate, user.id);
  if (!ok) return new Response("Too many requests", { status: 429, headers });

  const deal = await prisma.deal.create({
    data: { ...values, userId: user.id },
  });
  return NextResponse.json({ data: deal }, { status: 201, headers });
}).__ratelimit("dealsCreate");
