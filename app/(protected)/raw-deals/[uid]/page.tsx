import React, { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  Edit,
  ExternalLink,
  CreditCard,
  DollarSign,
  Hash,
  MapPin,
  Tag,
  Phone,
  Mail,
  Briefcase,
  Building,
  Percent,
  Plus,
  Upload,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import PreviousPageButton from "@/components/PreviousPageButton";
import { DealDetailItem } from "@/components/DealDetailItem";
import prismaDB from "@/lib/prisma";
import SimUploadDialog from "@/components/Dialogs/sim-upload-dialog";
import FetchDealSim from "@/components/FetchDealSim";
import SimItemSkeleton from "@/components/skeletons/SimItemSkeleton";
import FetchDealAIScreenings from "@/components/FetchDealAIScreenings";
import AIReasoningSkeleton from "@/components/skeletons/AIReasoningSkeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { exportDealToBitrix } from "@/app/actions/upload-bitrix";
import { toast } from "sonner";
import UploadDealToBitrixButton from "@/components/Buttons/upload-deal-bitrix-button";
import FetchDealPOC from "@/components/FetchDealPOC";
import DealDocumentUploadDialog from "@/components/Dialogs/deal-document-upload-dialog";
import FetchDealDocuments from "@/components/fetch-deal-documents";

type Params = Promise<{ uid: string }>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { uid } = await props.params;

  try {
    const fetchedDeal = await prismaDB.deal.findUnique({
      where: {
        id: uid,
      },
    });

    return {
      title: fetchedDeal?.dealCaption || "Raw Deal Page",
      description: fetchedDeal?.dealCaption || "Raw Deal Page",
    };
  } catch (error) {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist",
    };
  }
}

export default async function ManualDealSpecificPage(props: {
  params: Params;
}) {
  const { uid } = await props.params;
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
    tags,
    askingPrice,
    grossRevenue,
    dealType,
    bitrixId,
  } = fetchedDeal;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <PreviousPageButton />
      </div>

      <div className="mb-8 text-center">
        <Badge variant="secondary" className="mb-4">
          Manual Deal
        </Badge>
        <div className="mb-4 max-h-32 overflow-y-auto rounded-lg border border-border/50 bg-muted/30 p-4">
          <p className="break-words">{title}</p>
        </div>
        {dealCaption && (
          <div className="mx-auto max-w-4xl">
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="break-words text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
                {dealCaption}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="mb-1 text-sm font-medium text-muted-foreground">
          Tags
        </div>
        {tags && tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} className="rounded px-2 py-1 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-xs italic text-muted-foreground">
            No tags added yet.
          </div>
        )}
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href={`/raw-deals/${uid}/tags`}>
            <Tag className="mr-2 h-4 w-4" /> Add Tags
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/raw-deals/${uid}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Edit Deal
          </Link>
        </Button>
        {bitrixId ? (
          <Badge variant="outline">
            <CheckCircle className="mr-2 h-4 w-4" /> Deal Published to Bitrix
          </Badge>
        ) : (
          <UploadDealToBitrixButton specificDeal={fetchedDeal} />
        )}
        {sourceWebsite && (
          <Button asChild variant="outline">
            <Link href={sourceWebsite}>
              <ExternalLink className="mr-2 h-4 w-4" /> Visit Website
            </Link>
          </Button>
        )}
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 lg:gap-12">
        <Card className="h-fit overflow-hidden border-2 border-primary/10 shadow-lg transition-all duration-300 hover:border-primary/20 hover:shadow-primary/10">
          <CardHeader className="border-b bg-primary/5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-primary">
                Deal Details
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="border-primary/20 bg-primary/10 text-primary"
                    >
                      {dealType.charAt(0).toUpperCase() +
                        dealType.slice(1).toLowerCase()}{" "}
                      Deal
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {dealType === "MANUAL"
                        ? "This deal was manually added by a company member"
                        : dealType === "AI_INFERRED"
                          ? "This deal was automatically added using AI inference from the deal description"
                          : dealType === "SCRAPED"
                            ? "This deal was automatically scraped from external sources"
                            : "Deal type unknown"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-muted-foreground">
                Basic Information
              </h3>
              <DealDetailItem
                icon={<Hash className="text-blue-500" />}
                label="Deal ID"
                value={id}
              />
              <DealDetailItem
                icon={<Hash className="text-blue-500" />}
                label="Bitrix ID"
                value={bitrixId}
              />
              <DealDetailItem
                icon={<Tag className="text-green-500" />}
                label="Name"
                value={`${firstName} ${lastName}`}
              />
              <DealDetailItem
                icon={<Phone className="text-purple-500" />}
                label="Work Phone"
                value={workPhone}
              />
              <DealDetailItem
                icon={<Building className="text-amber-500" />}
                label="Brokerage"
                value={brokerage}
              />
              <DealDetailItem
                icon={<MapPin className="text-red-500" />}
                label="Location"
                value={companyLocation}
              />
              <DealDetailItem
                icon={<Briefcase className="text-indigo-500" />}
                label="Industry"
                value={industry}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-muted-foreground">
                Financial Details
              </h3>
              <DealDetailItem
                icon={<DollarSign className="text-emerald-500" />}
                label="Revenue"
                value={revenue}
              />
              <DealDetailItem
                icon={<DollarSign className="text-cyan-500" />}
                label="EBITDA"
                value={ebitda}
              />
              <DealDetailItem
                icon={<Percent className="text-violet-500" />}
                label="EBITDA Margin"
                value={ebitdaMargin}
              />
              <DealDetailItem
                icon={<CreditCard className="text-rose-500" />}
                label="Asking Price"
                value={askingPrice as number}
              />
              <DealDetailItem
                icon={<DollarSign className="text-teal-500" />}
                label="Gross Revenue"
                value={grossRevenue as number}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>AI Reasoning</CardTitle>

            <Button variant="outline" size="sm" asChild>
              <Link href={`/raw-deals/${uid}/screen`}>
                <Plus className="mr-2 h-4 w-4" /> Add AI Reasoning
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <Suspense
                fallback={
                  <div className="flex flex-col gap-4">
                    <AIReasoningSkeleton />
                    <AIReasoningSkeleton />
                    <AIReasoningSkeleton />
                  </div>
                }
              >
                <FetchDealAIScreenings dealId={uid} dealType={dealType} />
              </Suspense>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Deal Documents</CardTitle>
            <DealDocumentUploadDialog dealId={uid} dealType={dealType} />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <FetchDealDocuments dealId={uid} dealType={dealType} />
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
        <Card>
          <CardHeader>
            <CardTitle>Point of Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <FetchDealPOC dealId={uid} dealType={dealType} />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
