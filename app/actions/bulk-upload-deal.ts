"use server";

import { TransformedDeal } from "../types";
import prismaDB from "@/lib/prisma";
import { DealType } from "@prisma/client";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/redis";
import { headers } from "next/headers";

/**
 * Adds a list of transformed deals to Firebase.
 *
 * This asynchronous function handles bulk uploading of deals to Firebase Firestore.
 * Each deal is added to the "manual-deals" collection with a timestamp.
 *
 * @param {TransformedDeal[]} deals - An array of deals conforming to the `TransformedDeal` type.
 * @returns {Promise<{ type: string; message: string; failedDeals?: TransformedDeal[] }>}
 *          Returns an object indicating success or failure and lists any deals that failed to upload.
 */
const BulkUploadDealsToDB = async (deals: TransformedDeal[]) => {
  const userSession = await auth();

  if (!userSession) {
    return {
      error: "unauthorized user",
    };
  }

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const { ok, remaining, reset } = await rateLimit(
    `api:bulk-upload-deal:${ip}`,
    10, // 10 requests per minute
    60_000, // 1 minute
  );

  if (!ok) {
    console.log("Rate limit excedded for bulk upload db");

    return {
      error: "Too many requests",
    };
  }

  if (!Array.isArray(deals) || deals.length === 0) {
    return {
      error: "No deals or a valid array provided for bulk upload.",
    };
  }

  console.log("deals received", deals);

  try {
    await prismaDB.deal.createMany({
      data: deals.map((deal) => ({
        title: deal.dealCaption || null, // Title is optional in schema, use null as fallback
        dealCaption: deal.dealCaption || "", // Required in schema, use empty string as fallback
        firstName: String(deal.firstName) || null, // Optional in schema
        lastName: String(deal.lastName) || null, // Optional in schema
        email: deal.email || null, // Optional in schema
        linkedinUrl: deal.linkedinUrl || null, // Optional in schema
        workPhone: String(deal.workPhone) || null, // Optional in schema
        revenue: Number(deal.revenue) || 0,
        ebitda: Number(deal.ebitda) || 0,
        ebitdaMargin: Number(deal.ebitdaMargin) || 0,
        industry: deal.industry || "", // Required in schema, use empty string as fallback
        sourceWebsite: deal.sourceWebsite || "", // Required in schema, use empty string as fallback
        companyLocation: String(deal.companyLocation) || null, // Optional in schema
        brokerage: deal.brokerage || "", // Required in schema, use empty string as fallback
        dealType: DealType.MANUAL, // Fixed value, no fallback needed
        userId: userSession.user.id,
      })),
    });

    return {
      success: `${deals.length} deals uploaded successfully.`,
    };
  } catch (error) {
    console.error("Bulk upload error:", error);

    return {
      error: "Bulk upload failed due to a server error.",
    };
  }
};

export default BulkUploadDealsToDB;
