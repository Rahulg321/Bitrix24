"use server";

import { auth } from "@/auth";
import { InferDealSchema } from "@/components/schemas/infer-deal-schema";
import prismaDB from "@/lib/prisma.server";

export default async function SaveInferredDeal({
  generation,
}: {
  generation: string;
}) {
  const userSession = await auth();

  if (!userSession) {
    return {
      type: "error",
      message: "You are not logged in",
    };
  }

  try {
    const parsedJSONDeal = await JSON.parse(generation);

    const validatedFields = InferDealSchema.safeParse(parsedJSONDeal);

    if (!validatedFields.success) {
      return {
        type: "error",
        message: `Invalid deal ${validatedFields.error.message}`,
      };
    }

    console.log("parsed deal in save inferred deal is", validatedFields.data);

    const parsedDeal = validatedFields.data;

    console.log("saving inferred deals.....");

    const docRef = await prismaDB.deal.create({
      data: {
        sourceWebsite: parsedDeal.sourceWebsite || "",
        firstName: parsedDeal.firstName || "",
        lastName: parsedDeal.lastName || "",
        email: parsedDeal.email || "",
        companyLocation: parsedDeal.companyLocation || "",
        dealCaption: parsedDeal.dealCaption || "",
        industry: parsedDeal.industry || "",
        askingPrice: parsedDeal.askingPrice || 0,
        revenue: parsedDeal.revenue || 0,
        grossRevenue: parsedDeal.grossRevenue || 0,
        title: parsedDeal.title || "",
        ebitda: parsedDeal.ebitda || 0,
        ebitdaMargin: parsedDeal.ebitdaMargin || 0,
        brokerage: parsedDeal.brokerage || "Not Mentioned",
        dealType: "AI_INFERRED",
        userId: userSession.user?.id,
      },
    });

    return {
      type: "success",
      message: "Deal saved successfully",
      documentId: docRef.id,
    };
  } catch (error) {
    console.log(error);
    return {
      type: "error",
      message: "Something went wrong",
    };
  }
}
