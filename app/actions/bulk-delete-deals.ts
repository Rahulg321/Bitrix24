"use server";

import { auth } from "@/auth";
import prismaDB from "@/lib/prisma.server";
import { revalidatePath } from "next/cache";

/**
 * Deletes several deals in one call.
 *
 * @param dealIds    Array of deal IDs (Prisma `id` column) to purge
 */
const BulkDeleteDealsFromDb = async (dealIds: string[]) => {
  try {
    const userSession = await auth();
    if (!userSession || !userSession?.user) {
      return {
        type: "error",
        message: "You must be logged in to delete deals",
      };
    }

    const { count } = await prismaDB.deal.deleteMany({
      where: { id: { in: dealIds } },
    });

    revalidatePath("/raw-deals");

    return {
      type: "success",
      message: `${count} deal${count === 1 ? "" : "s"} deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting deals:", error);
    if (error instanceof Error) {
      return {
        type: "error",
        message: `Failed to delete deals: ${error.message}`,
      };
    }
    return {
      type: "error",
      message: "Failed to delete deals. Please try again.",
    };
  }
};

export default BulkDeleteDealsFromDb;
