"use server";
import { auth } from "@/auth";
import prismaDB from "@/lib/prisma";
import { DealType } from "@prisma/client";
import { del } from "@vercel/blob";
import getCurrentUserRole from "@/lib/data/current-user-role";

import { revalidatePath } from "next/cache";

const DeletePocFromDB = async (
  pocId: string,
  dealId: string,
) => {
  try {
    const session = await auth();

    if (!session) {
      return {
        type: "error",
        message: "User is not authenticated!!!!!",
      };
    }

    const currentUserRole = await getCurrentUserRole();

    if (currentUserRole !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    await prismaDB.pOC.delete({
      where: {
        id: pocId,
        dealId: dealId,
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
      message: "PoC deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting PoC: ", error);
    if (error instanceof Error) {
      return {
        type: "error",
        message: `Failed to delete PoC: ${error.message}`,
      };
    }

    return {
      type: "error",
      message: "Failed to delete cim. Please try again.",
    };
  }
};

export default DeletePocFromDB;
