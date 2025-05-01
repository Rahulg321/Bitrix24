"use server";

import { put } from "@vercel/blob";
import { DealType, PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { pocFormSchema } from "@/lib/schemas";
import prismaDB from "@/lib/prisma";

export default async function AddPoc(
  data: FormData,
  dealId: string,
  dealType: DealType,
) {
  const validatedFields = pocFormSchema.safeParse({
    name: data.get("name"),
    workPhone: data.get("workPhone"),
    email: data.get("email"),
  });

  if (!validatedFields.success) {
    return { success: false, error: "Invalid form data" };
  }

  console.log("successfully validated fields");

  const { name, email, workPhone, websites } = validatedFields.data;

  if (!dealId) {
    return { success: false, error: "Deal ID is required" };
  }

  try {
    // Save PoC metadata to database
    const poc = await prismaDB.pOC.create({
      data: {
        name: name,
        email: email,
        workPhone: workPhone,
        websites: websites,
        Deal: { connect: { id: dealId } },
      },
    });

    // Revalidate the deal page to show the new PoC
    switch (dealType) {
      case "MANUAL":
        revalidatePath(`/manual-deals/${dealId}`);
      case "SCRAPED":
        revalidatePath(`/raw-deals/${dealId}`);
      case "AI_INFERRED":
        revalidatePath(`/inferred-deals/${dealId}`);
    }

    return { success: true, poc };
  } catch (error) {
    console.error("Error uploading PoC:", error);
    return { success: false, error: "Failed to upload PoC" };
  }
}
