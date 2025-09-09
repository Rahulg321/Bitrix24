import React, { Suspense } from "react";
import { getAllScreeners } from "@/lib/queries";
import ScreeningWrapper from "./ScreeningWrapper";
import { Skeleton } from "@/components/ui/skeleton";

const page = async ({ params }: { params: Promise<{ uid: string }> }) => {
  const { uid } = await params;

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Deal Screening</h1>
        <p className="text-muted-foreground">
          Evaluate and screen deals using AI-powered analysis tools
        </p>
      </div>

      {/* Main Content Grid */}
      <Suspense fallback={<ScreenersSkeleton />}>
        <DisplayScreeners dealId={uid} />
      </Suspense>
    </div>
  );
};

export default page;

// Loading skeleton for screeners
function ScreenersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

async function DisplayScreeners({ dealId }: { dealId: string }) {
  const availableScreeners = await getAllScreeners();

  return (
    <ScreeningWrapper dealId={dealId} screeners={availableScreeners || []} />
  );
}
