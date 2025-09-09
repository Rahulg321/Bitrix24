import { auth } from "@/auth";
import { DocxLoader } from "@/lib/docx-loader";
import { PDFLoader } from "@/lib/pdf-loader";
import prismaDB from "@/lib/prisma";
import { newScreenerFormSchema } from "@/lib/zod-schemas/new-screener-form-schema";
import { put } from "@vercel/blob";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const userSession = await auth();

  if (!userSession) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!name) {
    return Response.json({ error: "No name provided" }, { status: 400 });
  }

  if (!description) {
    return Response.json({ error: "No description provided" }, { status: 400 });
  }

  const validatedData = newScreenerFormSchema.safeParse({
    name,
    description,
    file,
  });

  if (!validatedData.success) {
    return Response.json({ error: "Invalid data" }, { status: 400 });
  }

  const fileType = validatedData.data.file.type;
  const buffer = await file.arrayBuffer();

  let content = "";

  if (fileType === "application/pdf") {
    const pdfLoader = new PDFLoader();
    const rawContent = await pdfLoader.loadFromBuffer(buffer);
    content = rawContent;
  } else if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const docxLoader = new DocxLoader();
    const rawContent = await docxLoader.loadFromBuffer(buffer);
    content = rawContent;
  } else {
    return Response.json({ error: "Unsupported file type" }, { status: 400 });
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
    return Response.json({ error: "Failed to upload file" }, { status: 500 });
  }

  try {
    const screener = await prismaDB.screener.create({
      data: {
        name: validatedData.data.name,
        description: validatedData.data.description,
        content,
        fileUrl: blobUrl,
      },
    });

    return Response.json({ screener }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create screener" },
      { status: 500 },
    );
  }
}
