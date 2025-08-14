import { auth } from "@/auth";
import { dealDocumentFormSchema } from "@/lib/schemas";
import prismaDB from "@/lib/prisma.server";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const userSession = await auth();

  if (!userSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const category = formData.get("category");
  const file = formData.get("file");
  const dealId = formData.get("dealId");

  if (!title || !description || !category || !file || !dealId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if (!dealId) {
    return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });
  }

  const validatedData = dealDocumentFormSchema.safeParse({
    title,
    description,
    category,
    file,
  });

  if (!validatedData.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  let blobUrl: string;

  try {
    const blob = await put(
      validatedData.data.file.name,
      validatedData.data.file,
      {
        access: "public",
      },
    );
    blobUrl = blob.url;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }

  // Save CIM metadata to database

  try {
    const dealDocument = await prismaDB.dealDocument.create({
      data: {
        title: validatedData.data.title,
        description: validatedData.data.description,
        category: validatedData.data.category,
        documentUrl: blobUrl,
        dealId: dealId as string,
      },
    });

    revalidatePath(`/raw-deals/${dealId}`);

    return NextResponse.json({ success: true, dealDocument });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save deal document" },
      { status: 500 },
    );
  }
}
