"use server";

import { withAuthServerAction } from "@/lib/withAuth";
import prismaDB from "@/lib/prisma.server";
import { User } from "@prisma/client";
import { revalidatePath } from "next/cache";

const deletePoc = withAuthServerAction(
  async (user: User, pocId: string, dealId: string) => {
    try {
      const poc = await prismaDB.pOC.delete({
        where: { id: pocId },
      });

      revalidatePath(`/raw-deals/${dealId}`);
      revalidatePath(`/manual-deals/${dealId}`);

      return {
        type: "success",
        message: "POC deleted successfully.",
      };
    } catch (error) {
      console.error("Error deleting POC:", error);
      return {
        type: "error",
        message: "Failed to delete POC. Please try again.",
      };
    }
  },
);

export default deletePoc;
