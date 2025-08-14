import prismaDB from "@/lib/prisma.server";

/**
 * Get a user by their ID
 * @param userId - The ID of the user to get
 * @returns The user with the given ID
 */
export const getUserById = async (userId: string) => {
  try {
    return await prismaDB.user.findUnique({
      where: {
        id: userId,
      },
    });
  } catch (error) {
    console.log("error getting user by id", error);
    throw error;
  }
};
