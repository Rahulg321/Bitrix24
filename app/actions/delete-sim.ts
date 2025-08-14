"use server";
import { auth } from "@/auth";
import prismaDB from "@/lib/prisma.server";
import { DealType } from "@prisma/client";
import { del } from "@vercel/blob";

import { revalidatePath } from "next/cache";

const DeleteSimFromDB = async (
  cimId: string,
  dealType: DealType,
  dealId: string,
  fileUrl: string,
) => {
  try {
    const session = await auth();

    if (!session) {
      return {
        type: "error",
        message: "User is not authenticated!!!!!",
      };
    }

    await del(fileUrl);

    await prismaDB.sIM.delete({
      where: {
        id: cimId,
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
      message: "CIM deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting CIM: ", error);
    if (error instanceof Error) {
      return {
        type: "error",
        message: `Failed to delete cim: ${error.message}`,
      };
    }

    return {
      type: "error",
      message: "Failed to delete cim. Please try again.",
    };
  }
};

export default DeleteSimFromDB;
