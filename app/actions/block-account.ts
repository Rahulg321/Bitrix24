"use server";

import { auth } from "@/auth";
import getCurrentUserRole from "@/lib/data/current-user-role";
import prismaDB from "@/lib/prisma.server";
import { revalidatePath } from "next/cache";

const blockAccount = async (userId: string) => {
  try {
    const session = await auth();

    if (!session) throw new Error("Not Logged In");

    const currentUserRole = await getCurrentUserRole();

    if (currentUserRole !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    await prismaDB.user.update({
      where: {
        id: userId,
      },
      data: {
        isBlocked: true,
      },
    });

    revalidatePath("/admin");

    return {
      type: "success",
      message: "Account blocked successfully",
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default blockAccount;
