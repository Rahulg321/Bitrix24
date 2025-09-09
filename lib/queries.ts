// all our database queries for the app

import { User } from "next-auth";
import prismaDB from "./prisma";
import { withAuthServerAction } from "./withAuth";
import axios from "axios";
import { BitrixDealGET } from "@/app/types";

type BitrixMoney = { VALUE: string | number; CURRENCY: string };
type BitrixRaw = Record<string, any>;

/**
 * Fetches *all* deals visible to the webhook user.
 * – Pulls 50 at a time and follows the `next` cursor until exhausted.
 * – By default returns every standard field plus every UF_* field.
 * – Optional `filter`, `order`, and `select` objects let you narrow the query.
 */
export const listAndMapMyDeals = withAuthServerAction(
  async (user: User): Promise<BitrixDealGET[]> => {
    const BITRIX_URL = process.env.BITRIX24_WEBHOOK!;
    const endpoint = `${BITRIX_URL}/crm.deal.list.json`;

    /** Only ask for the fields we’ll map */
    const select = [
      "ID",
      "TITLE",
      "UF_CRM_1715146259470", // revenue
      "UF_CRM_1727869474151", // askingPrice (money)
      "UF_CRM_1715146404315", // sourceWebsite
      "UF_CRM_1711453168658", // companyLocation
      "UF_CRM_FIRST_NAME",
      "UF_CRM_LAST_NAME",
      "UF_CRM_EMAIL",
      "UF_CRM_LINKEDIN_URL",
      "UF_CRM_WORK_PHONE",
    ];

    const filter = { ORIGINATOR_ID: "DARK_ALPHA_APP" };
    const order = { ID: "DESC" };
    const LIMIT = 20;

    let start: number | undefined = 0;
    const deals: BitrixDealGET[] = [];

    do {
      // @ts-ignore
      const { data } = await axios.post(endpoint, {
        filter,
        select,
        order,
        start,
      });

      /* ---------- map every Bitrix row into Prisma shape ---------- */
      if (Array.isArray(data.result)) {
        for (const r of data.result as BitrixRaw[]) {
          deals.push(bitrixToPrisma(r));
          if (deals.length === LIMIT) break;
        }
      }

      if (deals.length === LIMIT) break;
      start = typeof data.next === "number" ? data.next : undefined;
    } while (start !== undefined);

    return deals.slice(0, LIMIT);
  },
);

function bitrixToPrisma(r: BitrixRaw): BitrixDealGET {
  const [revStr] = (r.UF_CRM_1715146259470 ?? "0").split("|");

  const money = r.UF_CRM_1727869474151 as BitrixMoney | null;

  return {
    id: String(r.ID),
    dealCaption: r.TITLE,
    revenue: Number(revStr) || 0,
    ebitda: 0, // not yet stored in Bitrix
    ebitdaMargin: 0,
    askingPrice: money ? Number(money.VALUE) : undefined,
    sourceWebsite: r.UF_CRM_1715146404315 ?? "",
    companyLocation: r.UF_CRM_1711453168658 ?? undefined,
    firstName: r.UF_CRM_FIRST_NAME ?? undefined,
    lastName: r.UF_CRM_LAST_NAME ?? undefined,
    email: r.UF_CRM_EMAIL ?? undefined,
    linkedinUrl: r.UF_CRM_LINKEDIN_URL ?? undefined,
    workPhone: r.UF_CRM_WORK_PHONE ?? undefined,
    brokerage: "Broker Dealer 2",
    dealType: "MANUAL",
  };
}

/**
 * Get a user by their id
 * @param id - the id of the user
 * @returns the user
 */
export const getUserById = async (id: string) => {
  try {
    return await prismaDB.user.findUnique({
      where: {
        id,
      },
    });
  } catch (error) {
    console.error("Error fetching user by id", error);
    throw new Error("Error fetching user by id");
  }
};

/**
 * Get a deal POC by deal id
 * @param dealId - the id of the deal
 * @returns the deal POC
 */
export const getDealPOC = async (dealId: string) => {
  try {
    return await prismaDB.pOC.findMany({
      where: { dealId },
    });
  } catch (error) {
    console.error("Error fetching deal POC", error);
    throw new Error("Error fetching deal POC");
  }
};

/**
 * Get all screeners
 * @returns all screeners
 */
export async function getAllScreeners() {
  try {
    return await prismaDB.screener.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error("Error fetching all screeners", error);
    return null;
  }
}

/**
 * Get all screeners
 * @returns all screeners
 */
export async function getAllScreenersWithContent() {
  try {
    return await prismaDB.screener.findMany({
      select: {
        id: true,
        name: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    console.error("Error fetching all screeners", error);
    return null;
  }
}

/**
 * Get all deal reasonings with screener name
 * @param dealId - the id of the deal
 * @returns all deal reasonings with screener name
 */
export async function getAllDealReasoningsWithScreenerName(dealId: string) {
  try {
    return await prismaDB.aiScreening.findMany({
      where: {
        dealId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        sentiment: true,
        score: true,
        explanation: true,
        createdAt: true,
        updatedAt: true,
        screener: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error(
      "Error fetching all deal reasonings with screener name",
      error,
    );
    return null;
  }
}

/**
 * Get a complete ai reasoning by id
 * @param reasoningId - the id of the reasoning
 * @returns the complete ai reasoning
 */
export async function getCompleteAiReasoningById(reasoningId: string) {
  try {
    return await prismaDB.aiScreening.findUnique({
      where: {
        id: reasoningId,
      },
      select: {
        id: true,
        title: true,
        sentiment: true,
        score: true,
        content: true,
        explanation: true,
        createdAt: true,
        updatedAt: true,
        screener: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
    return null;
  }
}
