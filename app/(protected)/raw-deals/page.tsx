// app/(protected)/raw-deals/page.tsx
import React, { Suspense } from "react";
import { Metadata } from "next";
import DealCardSkeleton from "@/components/skeletons/DealCardSkeleton";
import DealCard from "@/components/DealCard";
import SearchDeals from "@/components/SearchDeal";
import SearchDealsSkeleton from "@/components/skeletons/SearchDealsSkeleton";
import SearchEbitdaDeals from "@/components/SearchEbitdaDeals";
import DealTypeFilter from "@/components/DealTypeFilter";
import Pagination from "@/components/pagination";
import getCurrentUserRole from "@/lib/data/current-user-role";
import { DealType } from "@prisma/client";
import { GetAllDeals } from "@/app/actions/get-deal";
import DealContainer from "@/components/DealContainer";

export const metadata: Metadata = {
  title: "Inferred Deals",
  description: "View the inferred deals scraped using AI",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function RawDealsPage(props: {
  searchParams: SearchParams;
}) {
  const params = await props.searchParams;

  const search = Array.isArray(params.query)
    ? params.query[0]
    : params.query ?? "";
  const currentPage =
    Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1;
  const limit =
    Number(Array.isArray(params.limit) ? params.limit[0] : params.limit) || 20;
  const offset = (currentPage - 1) * limit;
  const ebitda =
    Array.isArray(params.ebitda) ? params.ebitda[0] : params.ebitda ?? "";

  const rawDealTypes = Array.isArray(params.dealType)
    ? params.dealType
    : params.dealType
    ? [params.dealType]
    : [];
  const dealTypes = rawDealTypes as DealType[];

  const { data, totalPages, totalCount } = await GetAllDeals({
    search,
    offset,
    limit,
    dealTypes,
    ebitda,
  });

  const currentUserRole = await getCurrentUserRole();

  return (
    <section className="block-space group container">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">Raw Deals</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Browse our unprocessed deals from manual entries, bulk uploads,
          web-scraping and AI-driven inferences.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <h4 className="text-lg">
            Total Deals: <strong>{totalCount}</strong>
          </h4>
          <div className="rounded-md bg-primary/10 px-3 py-1 text-sm">
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
          <DealTypeFilter />
        </div>
      </div>

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
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
        />
      )}

      <Pagination totalPages={totalPages} />
    </section>
  );
}

