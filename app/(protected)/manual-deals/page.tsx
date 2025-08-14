import DealCardSkeleton from "@/components/skeletons/DealCardSkeleton";
import { Metadata } from "next";
import React, { Suspense } from "react";
import FetchingManualDeals from "./FetchingManualDeals";
import prismaDB from "@/lib/prisma.server";
import DealCard from "@/components/DealCard";
import GetDeals from "@/app/actions/get-deal";
import Pagination from "@/components/pagination";
import SearchDeals from "@/components/SearchDeal";
import getCurrentUserRole from "@/lib/data/current-user-role";

export const metadata: Metadata = {
  title: "Manual Deals",
  description: "View the manual deals that were added by the admin",
};

// After
type SearchParams = Promise<{ [key: string]: string | undefined }>;

const ManualDealsPage = async (props: { searchParams: SearchParams }) => {
  const searchParams = await props.searchParams;
  const search = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || 20;
  const offset = (currentPage - 1) * limit;

  const { data, totalPages, totalCount } = await GetDeals({
    search,
    offset,
    limit,
    dealType: "MANUAL",
  });

  const currentUserRole = await getCurrentUserRole();

  return (
    <div className="block-space container">
      <h1 className="mb-4 text-center md:mb-6 lg:mb-8">Manual Deals</h1>
      <h4>Total Deals {totalCount}</h4>
      <div className="lg:md-12 mb-4 flex gap-4 md:mb-6">
        <SearchDeals />
        <Pagination totalPages={totalPages} />
        <div>
          <h5>Page {currentPage}</h5>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="blog-index">
            <DealCardSkeleton />
            <DealCardSkeleton />
            <DealCardSkeleton />
            <DealCardSkeleton />
            <DealCardSkeleton />
            <DealCardSkeleton />
          </div>
        }
      >
        <div className="blog-index">
          {data.map((e) => {
            return <DealCard key={e.id} deal={e} userRole={currentUserRole!} />;
          })}
        </div>
      </Suspense>
    </div>
  );
};

export default ManualDealsPage;
