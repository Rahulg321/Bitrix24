"use server";

import prismaDB from "@/lib/prisma";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export default async function DeleteBaseline(
  blobUrl: string,
  questionnaireId: string,
) {
  try {
    await del(blobUrl);

    await prismaDB.questionnaire.delete({
      where: {
        id: questionnaireId,
      },
    });

    revalidatePath("/questionnaires");
    return {
      type: "success",
      message: "Baseline deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting deal: ", error);
    if (error instanceof Error) {
      return {
        type: "error",
        message: `Failed to  delete baseline: ${error.message}`,
      };
    }

    return {
      type: "error",
      message: "Failed to delete baseline. Please try again.",
    };
  }
}
