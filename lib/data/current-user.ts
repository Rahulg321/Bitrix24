// helper function to get the current User

import prismaDB from "../prisma.server";

/**
 * get the current user by using their id
 *
 * @param userId - the id of the user
 * @returns the user object
 */
export async function getCurrentUserById(userId: string) {
  try {
    const existingUser = await prismaDB.user.findUnique({
      where: {
        id: userId,
      },
    });

    return existingUser;
  } catch (error) {
    console.log("an error occured while trying to get current user");
    return null;
  }
}

/**
 * get the current user by using their email
 *
 * @param userEmail - the email of the user
 * @returns the user object
 */
export async function getCurrentUserByEmail(userEmail: string) {
  try {
    const existingUser = await prismaDB.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    return existingUser;
  } catch (error) {
    console.log("an error occured while trying to get current user");
    return null;
  }
}
