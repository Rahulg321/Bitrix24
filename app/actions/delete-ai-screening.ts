"use server";
import prismaDB from "@/lib/prisma.server";
import { DealType } from "@prisma/client";

import { revalidatePath } from "next/cache";

const DeleteAIScreeningFromDB = async (
  screeningId: string,
  dealType: DealType,
  dealId: string,
) => {
  try {
    await prismaDB.aiScreening.delete({
      where: {
        id: screeningId,
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
      message: "AI SCRENNING deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting AI SCRENNING: ", error);
    if (error instanceof Error) {
      return {
        type: "error",
        message: `Failed to delete AI SCRENNING: ${error.message}`,
      };
    }

    return {
      type: "error",
      message: "Failed to delete cim. Please try again.",
    };
  }
};

export default DeleteAIScreeningFromDB;
