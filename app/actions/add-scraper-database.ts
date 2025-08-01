"use server";

import {
  NewDealFormSchema,
  NewDealFormSchemaType,
} from "@/components/forms/new-deal-form";
import prismaDB from "@/lib/prisma";
import { withAuthServerAction } from "@/lib/withAuth";
import { DealType, User, DealStatus } from "@prisma/client";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import React from "react";

export const addScraperResultsToDatabase = withAuthServerAction(
  async (userId, values) => {
    try {
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
          dealType: DealType.DRAFT,
          userId: userId,
          dealLink: values.dealLink,
          dealStatus: values.dealStatus || DealStatus.UNKNOWN,
        },
      });

      revalidatePath(`/manual-deals`);

      return {
        dealId: addedDeal.id,
        success: "Deal added successfully",
      };
    } catch (error) {
      console.error("Error adding deal: ", error);
      if (error instanceof Error) {
        return {
          error:
          error.message.length > 0
          ? error.message
          : "Failed to add the deal. Please try again.",
        };
      }

      return {
        error: "Failed to add the deal. Please try again.",
      };
    }
  },
);
