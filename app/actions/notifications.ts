"use server";

import prismaDB from "@/lib/prisma";

export async function getNotifications(userId: string) {
  const notifications = await prismaDB.notification.findMany({
    where: {
      userId: userId,
    },
		orderBy: {
			createdAt: 'desc'
		}
  });
  return notifications;
}

export async function markNotificationAsSeen(notificationId: string) {
  await prismaDB.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      seen: true,
    },
  });
}
