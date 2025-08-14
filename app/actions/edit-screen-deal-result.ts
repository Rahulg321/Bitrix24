"use server";

import { auth } from "@/auth";
import prismaDB from "@/lib/prisma.server";
import { screenDealSchemaType } from "@/lib/schemas";
import { DealType } from "@prisma/client";
import { revalidatePath } from "next/cache";

// this function will be used to edit the results of a Deal screened using AI
const editScreenDealResult = async (
  screeningId: string,
  dealId: string,
  values: screenDealSchemaType,
  dealType: DealType,
) => {
  try {
    const session = await auth();

    if (!session) {
      return {
        type: "error",
        message: "User is not authenticated",
      };
    }

    if (!screeningId) {
      return {
        type: "error",
        message: "Screening Id not provided",
      };
    }

    if (!dealId) {
      return {
        type: "error",
        message: "DEAL Id not provided",
      };
    }

    if (!dealType) {
      return {
        type: "error",
        message: "DEAL Type not provided",
      };
    }

    await prismaDB.aiScreening.update({
      where: {
        id: screeningId,
      },
      data: {
        ...values,
      },
    });

    // revalidate path based on type of deal

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
      message: "",
    };
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Error Occured while editing screening result",
    };
  }
};

export default editScreenDealResult;
