import React, { Suspense } from "react";

import {
  Check,
  CreditCard,
  Cross,
  DollarSignIcon,
  Handshake,
  Hash,
  MapPinIcon,
  MinusCircle,
  Tag,
  Edit,
  ExternalLink,
  WebhookIcon,
  Phone,
  DollarSign,
  Building,
  Briefcase,
  Percent,
  Plus,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

import path from "path";
import * as fs from "fs/promises";
import { Metadata } from "next";
import { MdOutlineNumbers } from "react-icons/md";
import { fetchSpecificInferredDeal } from "@/lib/firebase/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PreviousPageButton from "@/components/PreviousPageButton";
import ScreenDealDialog from "@/components/Dialogs/screen-deal-dialog";
import prismaDB from "@/lib/prisma";
import { DealDetailItem } from "@/components/DealDetailItem";
import AIReasoning from "@/components/AiReasoning";
import SimUploadDialog from "@/components/Dialogs/sim-upload-dialog";
import SimItemSkeleton from "@/components/skeletons/SimItemSkeleton";
import FetchDealSim from "@/components/FetchDealSim";
import { ScrollArea } from "@/components/ui/scroll-area";

type Params = Promise<{ uid: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { uid } = await params;

  try {
    const fetchedDeal = await prismaDB.deal.findUnique({
      where: {
        id: uid,
      },
    });

    return {
      title: fetchedDeal?.title || "Specific Deal",
      description: fetchedDeal?.dealCaption || "Generated by create next app",
    };
  } catch (error) {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist",
    };
  }
}

const InferredDealSpecificPage = async ({ params }: { params: Params }) => {
  const { uid } = await params;

  const fetchedDeal = await prismaDB.deal.findUnique({
    where: {
      id: uid,
    },
  });

  if (!fetchedDeal) {
    return (
      <section className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Deal Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The deal you are looking for does not exist or has been removed.
            </p>
            <Button asChild className="mt-4">
              <Link href="/manual-deals">Back to Manual Deals</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const {
    id,
    firstName,
    lastName,
    workPhone,
    revenue,
    ebitda,
    title,
    sourceWebsite,
    brokerage,
    dealCaption,
    companyLocation,
    industry,
    ebitdaMargin,
    askingPrice,
    grossRevenue,
    dealType,
  } = fetchedDeal;

  const aiReasonings = [
    {
      title: "Financial Analysis",
      explanation:
        "The company's financial metrics show strong potential. With an EBITDA of $" +
        ebitda +
        " and a revenue of $" +
        revenue +
        ", the business demonstrates a healthy profit margin. The asking price of $" +
        askingPrice +
        " seems reasonable given the financial performance.\n\nHowever, it's important to note that the EBITDA margin of " +
        ebitdaMargin +
        "% is slightly below industry average. This could indicate potential areas for operational improvement or cost-cutting measures that could increase profitability under new management.",
      sentiment: "positive",
      date: "2023-06-15",
    },
    {
      title: "Market Position",
      explanation:
        "Operating in the " +
        industry +
        " industry, this company has established a significant market presence. The industry has shown steady growth over the past few years, and this trend is expected to continue.\n\nThe company's location in " +
        companyLocation +
        " provides access to a skilled workforce and a robust business ecosystem. However, it's crucial to assess the local competition and market saturation to ensure continued growth potential.",
      sentiment: "neutral",
      date: "2023-06-16",
    },
    {
      title: "Growth Opportunities",
      explanation:
        "There appear to be several avenues for potential growth:\n\n1. Expansion into new geographic markets\n2. Development of new product lines or services\n3. Implementation of more efficient operational processes\n4. Exploration of strategic partnerships or acquisitions\n\nHowever, each of these opportunities would require careful planning and execution. It's recommended to conduct a thorough SWOT analysis before pursuing any major growth initiatives.",
      sentiment: "positive",
      date: "2023-06-17",
    },
    {
      title: "Risk Assessment",
      explanation:
        "While the company shows promise, there are several risk factors to consider:\n\n1. Industry volatility: The " +
        industry +
        " sector can be subject to rapid changes and disruptions.\n2. Customer concentration: It's crucial to assess whether the company relies heavily on a small number of key clients.\n3. Regulatory environment: Changes in regulations could impact operations and profitability.\n4. Technology risks: Ensure the company's technology stack is up-to-date and competitive.\n\nA more in-depth due diligence process is recommended to fully understand and mitigate these potential risks.",
      sentiment: "negative",
      date: "2023-06-18",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <PreviousPageButton />
      </div>

      <div className="mb-8 text-center">
        <Badge variant="secondary" className="mb-4">
          Inferred Deal
        </Badge>
        <h1 className="mb-4 text-4xl font-bold">{title}</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {dealCaption}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href={`/inferred-deals/${uid}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit Deal
          </Link>
        </Button>
        {sourceWebsite && (
          <Button asChild variant="outline">
            <Link href={sourceWebsite}>
              <ExternalLink className="mr-2 h-4 w-4" /> Visit Website
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inferred Deal Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DealDetailItem icon={<Hash />} label="Deal ID" value={id} />
            <DealDetailItem
              icon={<Tag />}
              label="Name"
              value={`${firstName} ${lastName}`}
            />
            <DealDetailItem
              icon={<Phone />}
              label="Work Phone"
              value={workPhone}
            />

            <DealDetailItem
              icon={<DollarSign />}
              label="Revenue"
              value={revenue}
            />
            <DealDetailItem
              icon={<DollarSign />}
              label="EBITDA"
              value={ebitda}
            />
            <DealDetailItem
              icon={<Building />}
              label="Brokerage"
              value={brokerage}
            />
            <DealDetailItem
              icon={<MapPinIcon />}
              label="Location"
              value={companyLocation}
            />
            <DealDetailItem
              icon={<Briefcase />}
              label="Industry"
              value={industry}
            />
            <DealDetailItem
              icon={<Percent />}
              label="EBITDA Margin"
              value={ebitdaMargin}
            />
            <DealDetailItem
              icon={<CreditCard />}
              label="Asking Price"
              value={askingPrice as number}
            />
            <DealDetailItem
              icon={<DollarSign />}
              label="Gross Revenue"
              value={grossRevenue as number}
            />
          </CardContent>
        </Card>

        <Card className="lg:row-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>AI Reasoning</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/manual-deals/${id}/screen`}>
                <Plus className="mr-2 h-4 w-4" /> Add AI Reasoning
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[700px] pr-4">
              {aiReasonings.length > 0 ? (
                aiReasonings.map((e, index) => (
                  <AIReasoning
                    key={index}
                    title={e.title}
                    explanation={e.explanation}
                    sentiment={e.sentiment!}
                    date={e.date}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">
                    No AI Reasoning Available
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    AI analysis for this deal has not been generated yet. Check
                    back later or request an analysis.
                  </p>
                  <Button className="mt-4" variant="outline">
                    Request AI Analysis
                  </Button>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>SIMs (Strategic Investment Memos)</CardTitle>
            <SimUploadDialog dealId={uid} dealType={dealType} />
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="flex flex-col gap-4">
                  <SimItemSkeleton />
                  <SimItemSkeleton />
                </div>
              }
            >
              <ScrollArea className="h-[300px] pr-4">
                <FetchDealSim dealId={uid} dealType={dealType} />
              </ScrollArea>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default InferredDealSpecificPage;
