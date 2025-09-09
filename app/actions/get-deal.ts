"use server";

import "server-only";

import prismaDB from "@/lib/prisma";
import { Deal, DealStatus, DealType } from "@prisma/client";
import { unstable_cache } from "next/cache";

interface GetDealsResult {
  data: Deal[];
  totalCount: number;
  totalPages: number;
}

export default async function GetDeals({
  search,
  offset = 0,
  limit = 20,
  dealType,
}: {
  search?: string | undefined;
  offset?: number;
  limit?: number;
  dealType: DealType;
}): Promise<GetDealsResult> {
  const [data, totalCount] = await Promise.all([
    prismaDB.deal.findMany({
      where: { dealType, dealCaption: { contains: search } },
      skip: offset,
      take: limit,
    }),

    prismaDB.deal.count({
      where: { dealType, dealCaption: { contains: search } },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return { data, totalCount, totalPages };
}

/**
 *
 * get all deals with pagination and filter by deal type
 *
 * @param search - search query
 * @param offset - offset
 * @param limit - limit
 * @param dealTypes - deal types
 * @param ebitda - ebitda
 * @param revenue - revenue
 * @param maxRevenue - max revenue
 * @param userId - user id
 * @returns
 */
export const GetAllDeals = async ({
  search,
  offset = 0,
  limit = 50,
  dealTypes,
  ebitda,
  revenue,
  userId,
  location,
  maxRevenue,
  maxEbitda,
  brokerage,
  industry,
  ebitdaMargin,
  showSeen,
  showReviewed,
  showPublished,
  status,
  tags,
  showRecent,
}: {
  search?: string | undefined;
  offset?: number;
  limit?: number;
  dealTypes?: DealType[];
  ebitda?: string;
  revenue?: string;
  userId?: string;
  location?: string;
  maxRevenue?: string;
  maxEbitda?: string;
  brokerage?: string;
  industry?: string;
  ebitdaMargin?: string;
  showSeen?: boolean;
  showReviewed?: boolean;
  showPublished?: boolean;
  status?: DealStatus;
  tags?: string[];
  showRecent?: boolean;
}): Promise<GetDealsResult> => {
  const ebitdaValue = ebitda ? parseFloat(ebitda) : undefined;
  const revenueValue = revenue ? parseFloat(revenue) : undefined;
  const locationValue = location ? location : undefined;
  const maxRevenueValue = maxRevenue ? parseFloat(maxRevenue) : undefined;
  const maxEbitdaValue = maxEbitda ? parseFloat(maxEbitda) : undefined;
  const brokerageValue = brokerage ? brokerage : undefined;
  const industryValue = industry ? industry : undefined;
  const ebitdaMarginValue = ebitdaMargin ? parseFloat(ebitdaMargin) : undefined;

  const orderBy = showRecent
    ? { createdAt: "desc" as const }
    : { createdAt: "asc" as const };

  const whereClause = {
    ...(search ? { dealCaption: { contains: search } } : {}),
    ...(dealTypes && dealTypes.length > 0
      ? { dealType: { in: dealTypes } }
      : {}),
    ...(ebitdaValue !== undefined ? { ebitda: { gte: ebitdaValue } } : {}),
    ...(revenueValue !== undefined ? { revenue: { gte: revenueValue } } : {}),
    ...(maxEbitdaValue !== undefined
      ? { ebitda: { lte: maxEbitdaValue } }
      : {}),
    ...(maxRevenueValue !== undefined
      ? { revenue: { lte: maxRevenueValue } }
      : {}),
    ...(userId ? { userId: { equals: userId } } : {}),
    ...(locationValue !== undefined
      ? { companyLocation: { contains: locationValue } }
      : {}),
    ...(brokerageValue !== undefined
      ? { brokerage: { contains: brokerageValue } }
      : {}),
    ...(industryValue !== undefined
      ? { industry: { contains: industryValue } }
      : {}),
    ...(ebitdaMarginValue !== undefined
      ? { ebitdaMargin: { gte: ebitdaMarginValue } }
      : {}),
    ...(showSeen ? { seen: { equals: showSeen } } : {}),
    ...(showReviewed ? { isReviewed: { equals: showReviewed } } : {}),
    ...(showPublished ? { isPublished: { equals: showPublished } } : {}),
    ...(status ? { status: { equals: status } } : {}),
    ...(tags && tags.length > 0 ? { tags: { hasSome: tags } } : {}),
  };

  const [data, totalCount] = await Promise.all([
    prismaDB.deal.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy,
    }),
    prismaDB.deal.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return { data, totalCount, totalPages };
};
