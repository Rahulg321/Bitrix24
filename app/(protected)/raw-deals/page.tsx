import React, { Suspense } from "react";
import { Metadata } from "next";
import getCurrentUserRole from "@/lib/data/current-user-role";
import { GetAllDeals } from "@/app/actions/get-deal";
import SearchDeals from "@/components/SearchDeal";
import Pagination from "@/components/pagination";
import DealTypeFilter from "@/components/DealTypeFilter";
import { DealStatus, DealType } from "@prisma/client";
import SearchDealsSkeleton from "@/components/skeletons/SearchDealsSkeleton";
import SearchEbitdaDeals from "@/components/SearchEbitdaDeals";
import DealTypeFilterSkeleton from "@/components/skeletons/DealTypeFilterSkeleton";
import UserDealFilter from "@/components/UserDealFilter";
import DealContainer from "@/components/DealContainer";
import SearchRevenueDeals from "@/components/search-revenue-deals";
import SearchLocationDeals from "@/components/search-location-deals";
import SearchMaxRevenueDeals from "@/components/search-max-revenue-deals";
import SearchMaxEbitdaDeals from "@/components/search-max-ebitda-deals";
import SearchBrokerageDeals from "@/components/SearchBrokerageDeals";
import SearchIndustryDeals from "@/components/SearchIndustryDeals";
import SearchEbitdaMarginFilter from "@/components/SearchEbitdaMarginFilter";
import SearchSeenDeals from "@/components/search-seen-deals";
import SearchReviewedDeals from "@/components/search-review-deals";
import SearchPublishedDeals from "@/components/search-published-deals";
import SearchStatusDeals from "@/components/search-status-deals";
import SearchTagsDeals from "@/components/search-tags-deals";
import DeleteFiltersButton from "@/components/Buttons/delete-filters-button";
import SearchRecentDeals from "@/components/search-recent-deals";



export const metadata: Metadata = {
  title: "Raw Deals",
  description: "View the raw deals",
};

type SearchParams = Promise<{ [key: string]: string | undefined }>;

const RawDealsPage = async (props: { searchParams: SearchParams }) => {
  const searchParams = await props.searchParams;
  const search = searchParams?.query || "";
  const revenue = searchParams?.revenue || "";
  const location = searchParams?.location || "";
  const maxRevenue = searchParams?.maxRevenue || "";
  const maxEbitda = searchParams?.maxEbitda || "";
  const brokerage = searchParams?.brokerage || "";
  const industry = searchParams?.industry || "";
  const ebitdaMargin = searchParams?.ebitdaMargin || "";
  const currentPage = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 50;
  const offset = (currentPage - 1) * limit;
  const ebitda = searchParams?.ebitda || "";
  const userId = searchParams?.userId || "";
  const showSeen = searchParams?.seen === "true" ? true : false;
  const showRecent = searchParams?.recent === "true" ? true : false;
  const showReviewed = searchParams?.reviewed === "true" ? true : false;
  const showPublished = searchParams?.published === "true" ? true : false;

  const status = searchParams?.status || "";

  const dealTypes =
    typeof searchParams?.dealType === "string"
      ? [searchParams.dealType]
      : searchParams?.dealType || [];

  const tags =
    typeof searchParams?.tags === "string"
      ? [searchParams.tags]
      : searchParams?.tags || [];

  console.log("tags inside filter", tags);

  const { data, totalPages, totalCount } = await GetAllDeals({
    search,
    offset,
    limit,
    dealTypes: dealTypes as DealType[],
    ebitda,
    userId,
    revenue,
    location,
    maxRevenue,
    maxEbitda,
    brokerage,
    industry,
    ebitdaMargin,
    showSeen,
    showRecent,
    showReviewed,
    showPublished,
    status: status as DealStatus,
    tags: tags as string[],
  });

  const currentUserRole = await getCurrentUserRole();

  return (
    <section className="block-space group container">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold md:mb-6 lg:mb-8">Raw Deals</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Browse through our collection of unprocessed deals gathered from
          various sources including manual entries, bulk uploads, external
          website scraping, and AI-inferred opportunities.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-medium">
              Total Deals: <span className="font-bold">{totalCount}</span>
            </h4>
            <div className="ml-4 rounded-md bg-primary/10 px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </div>
          </div>
          <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
            <Suspense fallback={<DealTypeFilterSkeleton />}>
              <DealTypeFilter />
            </Suspense>
            <Suspense fallback={<DealTypeFilterSkeleton />}>
              <UserDealFilter />
            </Suspense>
          </div>
        </div>

        {/* Responsive filter/search bar area */}
        <div className="grid w-full grid-cols-1 gap-4 rounded-lg bg-muted/50 p-4 shadow-sm sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchBrokerageDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchIndustryDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchEbitdaMarginFilter />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchEbitdaDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchRevenueDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchMaxRevenueDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchLocationDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchSeenDeals />
          </Suspense>
          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchRecentDeals />
          </Suspense>

          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchReviewedDeals />
          </Suspense>

          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchPublishedDeals />
          </Suspense>

          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchMaxEbitdaDeals />
          </Suspense>

          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchStatusDeals />
          </Suspense>

          <Suspense fallback={<SearchDealsSkeleton />}>
            <SearchTagsDeals />
          </Suspense>

          <DeleteFiltersButton />
        </div>
      </div>

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
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
          />
        )}
      </div>
      <div className="mt-8 flex justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </section>
  );
};

export default RawDealsPage;
