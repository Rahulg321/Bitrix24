import { NextResponse }  from "next/server";
import prisma            from "@/lib/prisma";
import { withAuth }      from "@/lib/withAuth";

// 50 requests / minute
async function handler(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";

  const matches = await prisma.deal.findMany({
    where: { title: { contains: q, mode: "insensitive" } },
    take: 25,
  });

  return NextResponse.json({ data: matches });
}

export const GET = withAuth(handler).__ratelimit("search");
