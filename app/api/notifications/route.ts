import { NextResponse }          from "next/server";
import prisma                    from "@/lib/prisma";
import { withAuth }              from "@/lib/withAuth";
import { limiters, enforce }     from "@/lib/rate-limit";

export const GET = withAuth(async (_req, user) => {
  const { ok, headers } = await enforce(limiters.notifications, user.id);
  if (!ok) return new Response("Too many requests", { status: 429, headers });

  const notes = await prisma.notification.findMany({
    where:   { recipientId: user.id },
    orderBy: { createdAt: "desc" },
    take:    25,
  });
  return NextResponse.json({ data: notes }, { headers });
}).__ratelimit("notifications");
