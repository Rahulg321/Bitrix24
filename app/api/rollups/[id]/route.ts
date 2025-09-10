// app/api/rollups/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// DELETE /api/rollups/:id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Optional auth check — comment out to bypass
    const userSession = await auth();
    if (!userSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deletedRollup = await prisma.rollup.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedRollup });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json({ error: "Failed to delete rollup" }, { status: 500 });
  }
}

// GET /api/rollups/:id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const rollup = await prisma.rollup.findUnique({
      where: { id },
      include: {
        users: true,  // users who saved this rollup
        deals: true,  // all deals in this rollup
      },
    });

    if (!rollup) {
      return NextResponse.json({ rollup: null }, { status: 404 });
    }

    return NextResponse.json({ rollup });
  } catch (error) {
    console.error("Error fetching rollup:", error);
    return NextResponse.json({ error: "Failed to fetch rollup" }, { status: 500 });
  }
}
