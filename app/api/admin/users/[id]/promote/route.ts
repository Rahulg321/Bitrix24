// app/api/admin/users/[id]/promote/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prismaDB from "@/lib/prisma";

export async function POST(
  request: Request,
  context: {
    // `params` is now a Promise that you must await
    params: Promise<{ id: string }>;
  }
) {
  // 1️⃣ Auth check
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2️⃣ Await the params before grabbing `id`
  const { id } = await context.params;

  // 3️⃣ Promote in the database
  await prismaDB.user.update({
    where: { id },
    data: { role: "ADMIN" },
  });

  return NextResponse.json({ message: "User promoted" });
}
