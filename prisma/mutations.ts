import prismaDB from "@/lib/prisma";
import { User } from "@prisma/client";

const LogUserAction = async (
  user: User,
  action: string,
  description: string
) => {
  try {
    await prismaDB.userActionLog.create({
      data: {
        userId: user.id,
        user: user,
        title: action,
        content: description
      },
    });
  } catch (error) {
    console.error("Error logging user action", error);
    throw new Error("Error logging user action");
  }
};

export { LogUserAction };
