"use server";

import {
  NewDealFormSchema,
  NewDealFormSchemaType,
} from "@/components/forms/new-deal-form";
import prismaDB from "@/lib/prisma";
import { DealType } from "@prisma/client";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import React from "react";
import { auth } from "../../auth";

/**
 * Adds a new deal to Firebase.
 *
 * This asynchronous function handles adding a new deal to Firebase based on values
 * validated by the `NewDealSchemaZodType` schema. It is intended for use in React applications
 * where form submissions are validated using Zod schemas before interacting with Firebase.
 *
 * @param {NewDealSchemaZodType} values - An object containing the form values that conform
 *                                         to the `NewDealSchemaZodType` schema. This includes
 *                                         all necessary fields and structure expected by Firebase.
 *
 * @returns {Promise<void>} Returns a promise that resolves once the deal has been added to Firebase.
 */
const AddDealToDB = async (values: NewDealFormSchemaType) => {
  try {

    console.log("in add deal to firebase", values);

    const addedDeal = await prismaDB.deal.create({
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
        dealType: DealType.MANUAL,
      },
    });

    
    (async () => {
      try {
        const session = await auth();
        const user = session?.user;
        
        if (!user || !user.id) {
          throw new Error("User not authenticated");
        }

        await prismaDB.log.create({
          data: {
            action: "Add Deal",
            userId: user.id,
            userName: user.name || "Unknown User",
            dealTitle: values.title,
            dealId: addedDeal.id,
            message: "Deal added successfully",
          },
        });
      } catch (logError) {
        console.error("Background logging failed:", logError);
      }
    })();

    revalidatePath(`/manual-deals`);

    return {
      type: "success",
      message: "Deal saved successfully",
      documentId: addedDeal.id,
    };
  } catch (error) {
    console.error("Error adding deal: ", error);
    if (error instanceof Error) {
      return {
        type: "error",
        message:
          error.message.length > 0
            ? error.message
            : "Failed to add the deal. Please try again.",
      };
    }

    return {
      type: "error",
      message: "Failed to add the deal. Please try again.",
    };
  }
};

export default AddDealToDB;
