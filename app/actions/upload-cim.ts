"use server";

import { put } from "@vercel/blob";
import { DealType, PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cimFormSchema } from "@/lib/schemas";
import prismaDB from "@/lib/prisma.server";

export default async function UploadCim(
  data: FormData,
  dealId: string,
  dealType: DealType,
) {
  const validatedFields = cimFormSchema.safeParse({
    title: data.get("title"),
    caption: data.get("caption"),
    status: data.get("status"),
    file: data.get("file"),
  });

  if (!validatedFields.success) {
    return { success: false, error: "Invalid form data" };
  }

  console.log("successfully validated fields");

  const { title, caption, status, file } = validatedFields.data;

  if (!dealId) {
    return { success: false, error: "Deal ID is required" };
  }

  try {
    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    });

    // Save CIM metadata to database
    const cim = await prismaDB.sIM.create({
      data: {
        title,
        caption,
        status,
        fileName: file.name,
        fileType: file.type,
        fileUrl: blob.url,
        deal: { connect: { id: dealId } },
      },
    });

    // Revalidate the deal page to show the new CIM
    switch (dealType) {
      case "MANUAL":
        revalidatePath(`/manual-deals/${dealId}`);
      case "SCRAPED":
        revalidatePath(`/raw-deals/${dealId}`);
      case "AI_INFERRED":
        revalidatePath(`/inferred-deals/${dealId}`);
    }

    return { success: true, cim };
  } catch (error) {
    console.error("Error uploading CIM:", error);
    return { success: false, error: "Failed to upload CIM" };
  }
}
