// app/(protected)/raw-deals/page.tsx
import React, { Suspense } from "react";
import { Metadata } from "next";
import { DealType } from "@prisma/client";

import GetDeals, { GetAllDeals } from "@/app/actions/get-deal";
import getCurrentUserRole from "@/lib/data/current-user-role";
import SearchDeals from "@/components/SearchDeal";
import SearchEbitdaDeals from "@/components/SearchEbitdaDeals";
import Pagination from "@/components/pagination";
import DealTypeFilter from "@/components/DealTypeFilter";
import UserDealFilter from "@/components/UserDealFilter";
import DealContainer from "@/components/DealContainer";

import DealCardSkeleton from "@/components/skeletons/DealCardSkeleton";
import SearchDealsSkeleton from "@/components/skeletons/SearchDealsSkeleton";
import DealTypeFilterSkeleton from "@/components/skeletons/DealTypeFilterSkeleton";

export const metadata: Metadata = {
  title: "Raw Deals",
  description: "View the raw deals",
};

type SearchParams = Promise<{ [key: string]: string | undefined }>;

export default async function RawDealsPage(props: { searchParams: SearchParams }) {
  // parse filters & pagination from URL
  const searchParams = await props.searchParams;
  const search = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 20;
  const offset = (currentPage - 1) * limit;
  const ebitda = searchParams?.ebitda || "";
  const userId = searchParams?.userId || "";
  const dealTypes =
    typeof searchParams?.dealType === "string"
      ? [searchParams.dealType]
      : searchParams?.dealType || [];

  // fetch deals + count
  const { data, totalPages, totalCount } = await GetAllDeals({
    search,
    offset,
    limit,
    dealTypes: dealTypes as DealType[],
    ebitda,
    userId,
  });

  // server‐side role check
  const currentUserRole = await getCurrentUserRole();
  const isAdmin = currentUserRole === "ADMIN";

  return (
    <section className="block-space group container">
      {/* — Header & filters */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">Raw Deals</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Browse our unprocessed deals from manual entries, bulk uploads,
          website scraping, and AI inference.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4 md:justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-medium">
            Total Deals: <span className="font-bold">{totalCount}</span>
          </h4>
          <div className="ml-4 rounded-md bg-primary/10 px-3 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchEbitdaDeals />
          </Suspense>
        </div>

        <Suspense fallback={<DealTypeFilterSkeleton />}>
          <DealTypeFilter />
        </Suspense>
        <Suspense fallback={<DealTypeFilterSkeleton />}>
          <UserDealFilter />
        </Suspense>
      </div>

      {/* — Deal list (grid or list) */}
      <div className="group-has-[[data-pending]]:animate-pulse">
        {data.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-xl text-muted-foreground">
              No deals found matching your criteria.
            </p>
          </div>
        ) : (
          <DealContainer
            data={data}
            userRole={currentUserRole!}
            isAdmin={isAdmin}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
          />
        )}
      </div>

      {/* — Pagination */}
      <Pagination totalPages={totalPages} />
    </section>
  );
}
