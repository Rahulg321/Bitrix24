"use server";

import prismaDB from "@/lib/prisma";
import { DealType } from "@prisma/client";

import { revalidatePath } from "next/cache";

/**
 * Adds a new deal to Firebase.
 *
 * This asynchronous function handles adding a new deal to Firebase based on values
 * validated by the `NewDealSchemaZodType` schema. It is intended for use in React applications
 * where form submissions are validated using Zod schemas before interacting with Firebase.
 *
 * @param {string} collectionName - Name of the collection we want to delete the deal from
 * @param {string} dealId - ID of the deal we want to delete
 *
 * @returns {Promise<void>} Returns a promise that resolves once the deal has been added to Firebase.
 */
const DeleteDealFromDB = async (dealType: DealType, dealId: string) => {
  try {
    await prismaDB.deal.delete({
      where: {
        id: dealId,
      },
    });

    switch (dealType) {
      case "MANUAL":
        revalidatePath("/manual-deals");
      case "SCRAPED":
        revalidatePath("/raw-deals");
      case "AI_INFERRED":
        revalidatePath("/inferred-deals");
    }

    return {
      type: "success",
      message: "Deal deleted successfully",
    };
  } catch (error) {
    console.error("Error adding deal: ", error);
    if (error instanceof Error) {
      return {
        type: "error",
        message: `Failed to delete deal: ${error.message}`,
      };
    }

    return {
      type: "error",
      message: "Failed to delete deal. Please try again.",
    };
  }
};

export default DeleteDealFromDB;
