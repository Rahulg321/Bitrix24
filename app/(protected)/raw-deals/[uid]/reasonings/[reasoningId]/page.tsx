import { getCompleteAiReasoningById } from "@/lib/queries";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, TrendingUp, MessageSquare, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import PreviousPageButton from "@/components/PreviousPageButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ uid: string; reasoningId: string }>;
}) => {
  const { uid: dealId, reasoningId } = await params;

  const userSession = await auth();

  if (!userSession) redirect("/login");

  const reasoning = await getCompleteAiReasoningById(reasoningId);

  if (!reasoning) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <PreviousPageButton />
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Reasoning not found
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The requested reasoning could not be found.
              </p>
              <Button asChild className="mt-4">
                <Link href={`/raw-deals/${dealId}/reasonings`}>
                  Back to Reasonings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <PreviousPageButton />
          <Button asChild variant="outline">
            <Link href={`/raw-deals/${dealId}/reasonings`}>
              View All Reasonings
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-4">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                  {reasoning.title}
                </CardTitle>
                <p className="text-muted-foreground">
                  AI-powered analysis and reasoning for this deal
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{reasoning.screener?.name || "Unknown Screener"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(reasoning.createdAt)}</span>
                </div>
                {reasoning.updatedAt &&
                  reasoning.updatedAt !== reasoning.createdAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Updated {formatDate(reasoning.updatedAt)}</span>
                    </div>
                  )}
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {reasoning.score && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {reasoning.score}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    AI assessment score
                  </p>
                </CardContent>
              </Card>
            )}

            {reasoning.sentiment && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant={
                      reasoning.sentiment === "POSITIVE"
                        ? "default"
                        : reasoning.sentiment === "NEGATIVE"
                          ? "destructive"
                          : "secondary"
                    }
                    className={`px-4 py-2 text-lg ${
                      reasoning.sentiment === "POSITIVE"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : reasoning.sentiment === "NEGATIVE"
                          ? "bg-red-100 text-red-800 hover:bg-red-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {reasoning.sentiment}
                  </Badge>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Overall sentiment analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {reasoning.explanation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Detailed Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div className="prose max-w-none text-foreground">
                  <ReactMarkdown>{reasoning.explanation}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {reasoning.content && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-foreground">
                  <ReactMarkdown>{reasoning.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default page;
