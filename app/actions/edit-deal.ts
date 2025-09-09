"use server";

import { EditDealFormSchemaType } from "@/components/forms/edit-deal-form";
import prismaDB from "@/lib/prisma";

import { revalidatePath } from "next/cache";

/**
 * Updates an existing deal in Firebase.
 *
 * This asynchronous function handles updating an existing deal in Firebase based on values
 * validated by the `NewDealFormSchemaType` schema. It is intended for use in React applications
 * where form submissions are validated using Zod schemas before interacting with Firebase.
 *
 * @param {EditDealFormSchemaType} values - An object containing the form values that conform
 * @param {string} dealId - The ID of the deal document to update.
 *                                         to the `NewDealFormSchemaType` schema. This includes
 *                                         all necessary fields and structure expected by Firebase.
 *
 * @param {DealType} dealType - The type of deal it returns
 *
 * @returns {Promise<object>} Returns a promise that resolves to an object indicating the result
 *                            of the update operation.
 */

export default async function EditDealFromFirebase(
  values: EditDealFormSchemaType,
  dealId: string,
) {
  try {
    await prismaDB.deal.update({
      where: {
        id: dealId,
      },
      data: {
        title: values.title,
        dealCaption: values.deal_caption,
        firstName: values.first_name,
        lastName: values.last_name,
        email: values.email,
        linkedinUrl: values.linkedinurl,
        workPhone: values.work_phone,
        revenue: values.revenue,
        ebitda: values.ebitda,
        ebitdaMargin: values.ebitda_margin,
        grossRevenue: values.gross_revenue,
        companyLocation: values.company_location,
        brokerage: values.brokerage,
        sourceWebsite: values.source_website || "",
        industry: values.industry,
        askingPrice: values.asking_price,
      },
    });

    revalidatePath(`/raw-deals/${dealId}`);

    return {
      type: "success",
      message: "Deal updated successfully",
      documentId: dealId,
    };
  } catch (error) {
    console.error("Error adding deal: ", error);
    if (error instanceof Error) {
      return {
        type: "error",
        message: `Failed to add the deal: ${error.message}`,
      };
    }

    return {
      type: "error",
      message: "Failed to add the deal. Please try again.",
    };
  }
}
