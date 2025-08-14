// app/api/deals/[id]/versions/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";

export async function GET(
  request: Request,
  context: { params: { id: string } },
) {
  // Next.js 15 dynamic params are async proxies – await before access to silence warning
  const id = await context.params.id;

  const rawVersions = await prisma.dealHistory.findMany({
    where: { dealId: id },
    orderBy: { createdAt: "desc" },
  });

  // ── Deduplicate snapshots that are byte-for-byte identical ──
  const versions: typeof rawVersions = [];
  const stripTimestamps = (obj: Record<string, any>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt: _c, updatedAt: _u, ...rest } = obj;
    return rest;
  };

  const seenSeconds = new Set<number>();
  rawVersions.forEach((v) => {
    const tsSec = Math.floor(new Date(v.createdAt).getTime() / 1000);
    if (seenSeconds.has(tsSec)) return; // skip other writes in same second window

    if (
      versions.length === 0 ||
      JSON.stringify(stripTimestamps(versions[versions.length - 1].snapshot)) !==
        JSON.stringify(stripTimestamps(v.snapshot))
    ) {
      versions.push(v);
      seenSeconds.add(tsSec);
    }
  });

  return NextResponse.json(versions);
}
