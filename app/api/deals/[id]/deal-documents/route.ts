import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";

// GET /api/deals/:id/deal-documents
export async function GET(
  _req: Request,
  context: { params: { id: string } },
) {
  // Next.js 15 dynamic params are async proxies – await before access to silence warning
  const id = await context.params.id;

  try {
    const data = await prisma.dealDocument.findMany({
      where: { dealId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Deal documents fetch error", error);
    return NextResponse.json(
      { error: "Failed to fetch deal documents" },
      { status: 500 },
    );
  }
}