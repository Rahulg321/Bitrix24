import PreviousPageButton from "@/components/PreviousPageButton";
import ScreenDealComponent from "@/components/ScreenDealComponent";
import prismaDB from "@/lib/prisma.server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";
import React, { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import AIReasoningSkeleton from "@/components/skeletons/AIReasoningSkeleton";
import { AlertTriangle } from "lucide-react";
import AIReasoning from "@/components/AiReasoning";
import { Button } from "@/components/ui/button";
import { DealType } from "@prisma/client";

type Params = Promise<{ uid: string }>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { uid } = await props.params;

  try {
    const fetchedDeal = await prismaDB.deal.findUnique({
      where: { id: uid },
      select: { dealCaption: true },
    });

    return {
      title: fetchedDeal?.dealCaption
        ? `Screen ${fetchedDeal.dealCaption}`
        : "Screen Deal",
      description: fetchedDeal?.dealCaption
        ? `Screen ${fetchedDeal.dealCaption} deal`
        : "Screen deal details",
    };
  } catch (error) {
    console.error("Error fetching deal metadata:", error);
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist",
    };
  }
}

const ScreenDealPage = async ({ params }: { params: Params }) => {
  const { uid } = await params;

  const fetchedDeal = await prismaDB.deal.findUnique({
    where: { id: uid },
  });

  if (!fetchedDeal) {
    return (
      <section className="container mx-auto px-4 py-8">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-red-500">
              Deal Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              The deal you are looking for was not found.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <PreviousPageButton />
          <h1 className="text-2xl font-bold">Deal Screening</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <ScreenDealComponent deal={fetchedDeal} />
          </div>
        </div>

        <h2 className="">View Screening Results</h2>
        <Suspense
          fallback={
            <div className="flex flex-col gap-4">
              <AIReasoningSkeleton />
              <AIReasoningSkeleton />
              <AIReasoningSkeleton />
            </div>
          }
        >
          <RenderDealScreenings dealId={uid} dealType={fetchedDeal.dealType} />
        </Suspense>
      </div>
    </section>
  );
};

export default ScreenDealPage;

async function RenderDealScreenings({
  dealId,
  dealType,
}: {
  dealId: string;
  dealType: DealType;
}) {
  const dealScreenings = await prismaDB.aiScreening.findMany({
    where: { dealId },
    select: {
      id: true,
      title: true,
      explanation: true,
      sentiment: true,
      deal: {
        select: {
          dealType: true,
        },
      },
    },
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {dealScreenings.length > 0 ? (
        dealScreenings.map((e, index) => (
          <AIReasoning
            key={index}
            title={e.title}
            explanation={e.explanation}
            sentiment={e.sentiment}
            dealId={dealId}
            dealType={dealType}
            screeningId={e.id}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No AI Reasoning Available</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            AI analysis for this deal has not been generated yet. Check back
            later or request an analysis.
          </p>
          <Button className="mt-4" variant="outline">
            Request AI Analysis
          </Button>
        </div>
      )}
    </div>
  );
}
