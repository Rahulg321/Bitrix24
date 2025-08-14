import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";

// GET /api/deals/:id/pocs
export async function GET(
  _req: Request,
  context: { params: { id: string } },
) {
  const id = await context.params.id;

  try {
    const data = await prisma.pOC.findMany({
      where: { dealId: id },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("POCs fetch error", error);
    return NextResponse.json({ error: "Failed to fetch POCs" }, { status: 500 });
  }
}