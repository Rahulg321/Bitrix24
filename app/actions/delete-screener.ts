"use server";

import { auth } from "@/auth";
import prismaDB from "@/lib/prisma";
import { rateLimit } from "@/lib/redis";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * @description Delete a screener
 * @param screenerId - The id of the screener to delete
 * @returns {Object} - An object containing the success status and message
 */
export async function deleteScreener(screenerId: string) {
  const userSession = await auth();

  if (!userSession) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const { ok } = await rateLimit(
    `api:delete-screener:${ip}`,
    10, // 10 requests per minute
    60_000, // 1 minute
  );

  if (!ok) {
    console.log("Rate limit excedded for delete screener");

    return {
      success: false,
      message: "Too many requests",
    };
  }

  if (!screenerId) {
    console.log("screener id is not defined");

    return {
      success: false,
      message: "screener id is not defined",
    };
  }

  try {
    await prismaDB.screener.delete({
      where: {
        id: screenerId,
      },
    });

    revalidatePath("/screeners");

    return {
      success: true,
      message: "deleted screener successfully",
    };
  } catch (error) {
    console.error("Error deleting screener", error);
    return {
      success: false,
      message: "Failed to delete screener",
    };
  }
}
