// import prismaDB from "@/lib/prisma";
// import { User } from "@prisma/client";

// const LogUserAction = async (
//   user: User,
//   action: string,
//   description: string,
//   metadata: Record<string, any>,
// ) => {
//   try {
//     await prismaDB.userActionLog.create({
//       data: {
//         userId: user.id,
//         action,
//         description,
//         metadata,
//         ipAddress: metadata.ipAddress || "unknown",
//         userAgent: metadata.userAgent || "unknown",
//         sessionId: metadata.sessionId || "unknown",
//       },
//     });
//   } catch (error) {
//     console.error("Error logging user action", error);
//     throw new Error("Error logging user action");
//   }
// };

// export { LogUserAction };
