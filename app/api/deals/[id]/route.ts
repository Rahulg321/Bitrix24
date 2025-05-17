// app/api/deals/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prismaDB from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1️⃣ get the current user session (server-side)
  const session = await auth();

  // 2️⃣ block non-admins
  if (session?.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  // 3️⃣ proceed with delete
  await prismaDB.deal.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
