"use server";

import { EditDealFormSchemaType } from "@/components/forms/edit-deal-form";
import { db } from "@/lib/firebase/init";
import prismaDB from "@/lib/prisma";
import { DealType } from "@prisma/client";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export default async function EditPoc(
  values: EditPocFormSchemaType,
  pocId: string,
) {
  try {

    const userSession = await auth();

    if (!userSession) {
      return {
        type: "error",
        message: "User is not authenticated!!!",
      };
    }

    await prismaDB.pOC.update({
      where: {
        id: pocId,
      },
      data: {
        name: values.name,
        workPhone: values.workPhone,
        email: values.email,
        websites: values.websites,
        email: values.email,
      },
    });

    LogUserAction(userSession.user, "Edited a PoC", "PoC ID: " + pocId);

    return {
      type: "success",
      message: "PoC updated successfully",
      documentId: dealId,
    };
  } catch (error) {
    console.error("Error adding PoC: ", error);
    if (error instanceof Error) {
      return {
        type: "error",
        message: `Failed to edit the PoC: ${error.message}`,
      };
    }

    return {
      type: "error",
      message: "Failed to edit the PoC. Please try again.",
    };
  }
}
