"use server";

// lib/bitrix.js
import axios from "axios";
import { Deal, User } from "@prisma/client";
import { auth } from "@/auth";
import prismaDB from "@/lib/prisma.server";
import { revalidatePath } from "next/cache";
import { withAuthServerAction } from "@/lib/withAuth";

/**
 * Exports a deal to Bitrix24 using the CRM API.
 *
 * @param {Object} deal - The deal object from your application.
 * @returns {Promise<Object>} - The response from Bitrix24 API.
 */
const exportDealToBitrix = withAuthServerAction(
  async (user: User, deal: Deal) => {
    const rawFields = {
      // Standard field: Deal name
      TITLE: deal.dealCaption,
      OPPORTUNITY: Number(deal.revenue),
      UF_CRM_1715146259470: Number(deal.revenue),
      UF_CRM_1715146404315: deal.sourceWebsite,
      UF_CRM_1711453168658: deal.companyLocation,
      UF_CRM_FIRST_NAME: deal.firstName,
      UF_CRM_LAST_NAME: deal.lastName,
      UF_CRM_EMAIL: deal.email,
      UF_CRM_LINKEDIN_URL: deal.linkedinUrl,
      UF_CRM_WORK_PHONE: deal.workPhone,
      COMMENTS: `Industry: ${deal.industry} | EBITDA: ${deal.ebitda} | EBITDA Margin: ${deal.ebitdaMargin}`,
      ORIGINATOR_ID: "DARK_ALPHA_APP",
      ORIGIN_ID: deal.id.toString(),
      UF_CRM_1727869474151:
        deal.askingPrice != null && !isNaN(deal.askingPrice as any)
          ? {
              VALUE: Number(deal.askingPrice),
              CURRENCY: "USD",
            }
          : undefined,
    };

    const fields = Object.fromEntries(
      Object.entries(rawFields).filter(
        ([_, v]) => v !== undefined && v !== null,
      ),
    );

    console.log("fields", fields);

    const BITRIX_URL = process.env.BITRIX24_WEBHOOK;
    const endpoint = `${BITRIX_URL}/crm.deal.add.json`;

    //   await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const response = await axios.post(endpoint, { fields });
      console.log("Deal exported to Bitrix24:", response.data);

      // Type assertion for response.data to handle the unknown type
      const responseData = response.data as { result?: number };
      console.log("response data", responseData);

      if (responseData.result) {
        await prismaDB.deal.update({
          where: { id: deal.id },
          data: {
            bitrixId: responseData.result.toString(),
            bitrixCreatedAt: new Date(),
          },
        });
      }

      revalidatePath(`/raw-deals/${deal.id}`);
      revalidatePath(`/raw-deals`);

      return response.data;
    } catch (error: any) {
      console.error(
        "Error exporting deal to Bitrix24:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
);

export { exportDealToBitrix };
