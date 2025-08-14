import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const id = await context.params.id;
  const data = await request.json();
  // data can be { reviewed: boolean } or { seen: boolean } etc.
  const updated = await prisma.deal.update({
    where: { id },
    data,
    select: { id: true },
  });
  return NextResponse.json(updated);
}
