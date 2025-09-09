import { getAllDealReasoningsWithScreenerName } from "@/lib/queries";
import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, FileText } from "lucide-react";
import AIReasoningSkeleton from "@/components/skeletons/AIReasoningSkeleton";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DeleteReasoningButton from "./delete-reasoning-button";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const page = async ({ params }: { params: Promise<{ uid: string }> }) => {
  const userSession = await auth();

  if (!userSession) redirect("/login");

  const dealId = (await params).uid;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Deal Reasonings
          </h1>
          <p className="text-muted-foreground">
            AI-powered analysis and reasoning for this deal
          </p>
        </div>

        <Suspense fallback={<ReasoningsSkeleton />}>
          <GetDealReasonings dealId={dealId} />
        </Suspense>
      </div>
    </div>
  );
};

export default page;

async function GetDealReasonings({ dealId }: { dealId: string }) {
  const reasonings = await getAllDealReasoningsWithScreenerName(dealId);

  if (!reasonings || reasonings.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No reasonings found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This deal doesn&apos;t have any AI reasonings yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {reasonings.map((reasoning, index) => (
        <ReasoningCard
          key={reasoning.id}
          reasoning={reasoning}
          index={index}
          dealId={dealId}
        />
      ))}
    </div>
  );
}

function ReasoningCard({
  reasoning,
  index,
  dealId,
}: {
  reasoning: any;
  index: number;
  dealId: string;
}) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <Card className="group transition-all duration-200 hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {reasoning.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {/* <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{reasoning.screener.name || "Unknown Screener"}</span>
              </div> */}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(reasoning.createdAt)}</span>
              </div>

              <div>
                <DeleteReasoningButton
                  reasoningId={reasoning.id}
                  dealId={dealId}
                />
              </div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20"
          >
            #{index + 1}
          </Badge>
        </div>
      </CardHeader>

      <Separator className="mx-6" />

      <CardContent className="space-y-4 pt-4">
        {/* Score and Sentiment */}
        <div className="flex items-center gap-4">
          {reasoning.score && (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-secondary text-secondary-foreground"
              >
                Score: {reasoning.score}
              </Badge>
            </div>
          )}
          {reasoning.sentiment && (
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  reasoning.sentiment === "POSITIVE"
                    ? "default"
                    : reasoning.sentiment === "NEGATIVE"
                      ? "destructive"
                      : "secondary"
                }
                className={
                  reasoning.sentiment === "POSITIVE"
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : reasoning.sentiment === "NEGATIVE"
                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }
              >
                {reasoning.sentiment}
              </Badge>
            </div>
          )}
        </div>

        {/* Explanation */}
        {reasoning.explanation && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Explanation</h4>
            <div className="prose prose-sm max-w-none text-foreground">
              <article className="prose prose-sm max-w-none text-foreground">
                <ReactMarkdown>{reasoning.explanation}</ReactMarkdown>
              </article>
            </div>
          </div>
        )}

        <Button asChild className="w-full">
          <Link href={`/raw-deals/${dealId}/reasonings/${reasoning.id}`}>
            View Details
          </Link>
        </Button>

        {/* Update timestamp */}
        {reasoning.updatedAt && reasoning.updatedAt !== reasoning.createdAt && (
          <div className="flex items-center gap-1 border-t pt-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Updated: {formatDate(reasoning.updatedAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReasoningsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <AIReasoningSkeleton key={index} />
      ))}
    </div>
  );
}
