"use server";

import { auth } from "@/auth";
import prismaDB from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteReasoning(reasoningId: string, dealId: string) {
  const userSession = await auth();

  if (!userSession?.user?.id) {
    console.log("user session not found");

    return {
      success: false,
      message: "User not found",
    };
  }

  if (!reasoningId) {
    console.log("reasoning id is not found");

    return {
      success: false,
      message: "Reasoning ID not found",
    };
  }

  try {
    await prismaDB.aiScreening.delete({
      where: {
        id: reasoningId,
      },
    });

    revalidatePath(`/raw-deals/${dealId}/reasonings`);

    return {
      success: true,
      message: "Reasoning deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting reasoning", error);
    return {
      success: false,
      message: "Error deleting reasoning",
    };
  }
}
