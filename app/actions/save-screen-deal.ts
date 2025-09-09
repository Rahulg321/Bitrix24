"use server";

import { auth } from "@/auth";

import prismaDB from "@/lib/prisma";
import { screenDealSchemaType } from "@/lib/schemas";
import { DealType } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Adds a new deal to Firebase.
 *
 * This asynchronous function handles adding a new deal to Firebase based on values
 * validated by the `NewDealSchemaZodType` schema. It is intended for use in React applications
 * where form submissions are validated using Zod schemas before interacting with Firebase.
 *
 * @param {NewDealSchemaZodType} values - An object containing the form values that conform
 *                                         to the `NewDealSchemaZodType` schema. This includes
 *                                         all necessary fields and structure expected by Firebase.
 *
 * @returns {Promise<void>} Returns a promise that resolves once the deal has been added to Firebase.
 */
const SaveScreeningResultToDB = async (
  values: screenDealSchemaType,
  dealId: string,
  dealType: DealType,
) => {
  try {
    const session = await auth();

    if (!session) {
      throw new Error("User not authenticated");
    }

    const addedScreenResult = await prismaDB.aiScreening.create({
      data: {
        dealId,
        title: values.title,
        explanation: values.explanation,
        sentiment: values.sentiment,
      },
    });

    switch (dealType) {
      case "MANUAL":
        revalidatePath(`/manual-deals/${dealId}`);
      case "SCRAPED":
        revalidatePath(`/raw-deals/${dealId}`);
      case "AI_INFERRED":
        revalidatePath(`/inferred-deals/${dealId}`);
    }

    return {
      type: "success",
      message: "Screening Result saved successfully",
      documentId: addedScreenResult.id,
    };
  } catch (error) {
    console.error("Error adding deal: ", error);
    if (error instanceof Error) {
      return {
        type: "error",
        message:
          error.message.length > 0
            ? error.message
            : "Failed to add the deal. Please try again.",
      };
    }

    return {
      type: "error",
      message: "Failed to add the deal. Please try again.",
    };
  }
};

export default SaveScreeningResultToDB;
