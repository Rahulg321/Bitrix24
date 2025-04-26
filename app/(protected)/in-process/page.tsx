// <project root>/app/(protected)/in-process/page.tsx
import React from "react";
import { Metadata } from "next";
import DealCard from "@/components/DealCard";
import Pagination from "@/components/pagination";
import SearchDeals from "@/components/SearchDeal";
import getCurrentUserRole from "../../../lib/data/current-user-role";
import prismaDB from "../../../lib/prisma";

export const metadata: Metadata = {
  title: "In Process Deals",
  description: "Deals you’ve moved into processing",
};

// Strictly type your props so TS knows what searchParams contains
type Props = {
  searchParams: {
    page?: string;
    [key: string]: string | undefined;
  };
};

const LIMIT = 20;

export default async function InProcessPage({ searchParams }: Props) {
  // parse page number
  const currentPage = Number(searchParams.page ?? "1");
  const offset = (currentPage - 1) * LIMIT;

  // fetch only deals with status = IN_PROCESS
  const [data, totalCount] = await Promise.all([
    prismaDB.deal.findMany({
      where: { status: "IN_PROCESS" },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: LIMIT,
    }),
    prismaDB.deal.count({ where: { status: "IN_PROCESS" } }),
  ]);

  const totalPages = Math.ceil(totalCount / LIMIT);

  // getCurrentUserRole can return undefined; assert non-null
  const userRole = (await getCurrentUserRole())!;

  return (
    <section className="block-space container">
      <h1 className="mb-6 text-center">In Process Deals</h1>
      <h4>Total: {totalCount}</h4>

      <div className="mb-4 flex flex-wrap gap-4">
        <SearchDeals />
        <Pagination totalPages={totalPages} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((deal) => (
          <DealCard key={deal.id} deal={deal} userRole={userRole} />
        ))}
      </div>
    </section>
  );
}
