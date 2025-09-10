// app/(protected)/rollup-details/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

// --- Deal type with extra AI placeholders ---
interface Deal {
  id: string;
  dealCaption: string;
  brokerage: string;
  revenue: number;
  ebitda: number;
  ebitdaMargin?: number;
  industry: string;
  score?: number;
  confidence_business_strategy?: number;
  confidence_growth_stage?: number;
  grossRevenue?: number;
  bitrixStatus?: string;
  business_strategy?: string;
  growth_stage?: string;
  dealTeaser?: string;
  chunk_text?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  linkedinUrl?: string;
  workPhone?: string;
  sourceWebsite?: string;
  location?: string;
  tags?: string;
  description?: string;
  title?: string;
}

interface User {
  id: string;
  name?: string | null;
  email: string;
  role?: string;
}

interface Rollup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deals: Deal[];
  users: User[];
  summary?: string; // AI summary placeholder
}

interface RollupDetailsPageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default function RollupDetailsPage({ params }: RollupDetailsPageProps) {
  const [rollup, setRollup] = useState<Rollup | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRollup() {
      try {
        const resolvedParams = await Promise.resolve(params);

        // --- fetch Prisma rollup data ---
        const res = await fetch(`/api/rollups/${resolvedParams.id}`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Failed to fetch rollup details");
          setRollup(null);
          return;
        }

        // --- placeholder for AI data ---
        const enrichedDeals = (data.rollup.deals || []).map((deal: Deal) => ({
          ...deal,
          score: Math.random(), // placeholder
          grossRevenue: deal.revenue * 1.1, // placeholder
          confidence_business_strategy: 0.8,
          confidence_growth_stage: 0.7,
          dealTeaser: deal.dealTeaser || "AI-generated teaser",
          chunk_text: deal.chunk_text || "AI-enriched chunk text",
          description: deal.description || "AI description placeholder",
        }));

        setRollup({ ...data.rollup, deals: enrichedDeals, summary: "This is a placeholder for the AI-generated summary." });
      } catch (error) {
        console.error("Error fetching rollup details:", error);
        toast.error("Error fetching rollup details");
      } finally {
        setLoading(false);
      }
    }

    fetchRollup();
  }, [params]);

  if (loading) return <div className="p-6">Loading rollup details...</div>;
  if (!rollup) return <div className="p-6">Rollup not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => router.back()}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" /> Previous Page
      </Button>

      <h1 className="text-2xl font-bold">{rollup.name}</h1>
      {rollup.description && <p className="text-muted-foreground">{rollup.description}</p>}
      <p className="text-sm text-muted-foreground">
        Created: {new Date(rollup.createdAt).toLocaleString()} | Updated: {new Date(rollup.updatedAt).toLocaleString()}
      </p>

      {rollup.summary && (
        <div className="p-3 bg-gray-50 rounded-md">
          <h2 className="font-semibold">AI Summary</h2>
          <p className="text-sm text-muted-foreground">{rollup.summary}</p>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">Deals</h2>
        <ul className="space-y-2">
          {rollup.deals.map((deal) => (
            <li key={deal.id} className="border rounded-md p-3 shadow-sm bg-background">
              <div className="font-semibold">{deal.title || deal.dealCaption}</div>
              <div className="text-sm text-muted-foreground">
                Brokerage: {deal.brokerage} | Revenue: ${deal.revenue.toLocaleString()} | Gross Revenue: ${deal.grossRevenue?.toLocaleString()} | EBITDA: ${deal.ebitda.toLocaleString()} | EBITDA Margin: {deal.ebitdaMargin ?? "—"}% | Industry: {deal.industry}
              </div>
              {deal.score !== undefined && <div className="text-sm text-muted-foreground">Score: {(deal.score * 100).toFixed(0)}%</div>}
              {deal.confidence_business_strategy !== undefined && (
                <div className="text-sm text-muted-foreground">
                  Confidence (Business Strategy): {(deal.confidence_business_strategy * 100).toFixed(0)}%
                </div>
              )}
              {deal.confidence_growth_stage !== undefined && (
                <div className="text-sm text-muted-foreground">
                  Confidence (Growth Stage): {(deal.confidence_growth_stage * 100).toFixed(0)}%
                </div>
              )}
              {deal.bitrixStatus && <div className="text-sm text-muted-foreground">Status: {deal.bitrixStatus}</div>}
              {deal.business_strategy || deal.growth_stage ? (
                <div className="text-sm text-muted-foreground">
                  Strategy: {deal.business_strategy || "—"} | Growth: {deal.growth_stage || "—"}
                </div>
              ) : null}
              {deal.dealTeaser && <div className="text-sm text-muted-foreground">{deal.dealTeaser}</div>}
              {deal.chunk_text && <div className="text-sm text-muted-foreground">{deal.chunk_text}</div>}
              {deal.description && <div className="text-sm text-muted-foreground">{deal.description}</div>}
              {(deal.firstName || deal.lastName || deal.email || deal.linkedinUrl || deal.workPhone) && (
                <div className="text-sm text-muted-foreground">
                  Contact: {deal.firstName || ""} {deal.lastName || ""} | {deal.email || "—"} |{" "}
                  {deal.linkedinUrl ? <a href={deal.linkedinUrl} className="text-blue-500 underline">LinkedIn</a> : "—"} | {deal.workPhone || "—"}
                </div>
              )}
              {deal.sourceWebsite && (
                <div className="text-sm text-muted-foreground">
                  Source: <a href={deal.sourceWebsite} className="text-blue-500 underline">{deal.sourceWebsite}</a>
                </div>
              )}
              {deal.location && <div className="text-sm text-muted-foreground">Location: {deal.location}</div>}
              {deal.tags && <div className="text-sm text-muted-foreground">Tags: {deal.tags}</div>}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Saved by Users</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          {rollup.users.map((user) => (
            <li key={user.id}>
              {user.name || user.email} {user.role ? `(${user.role})` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
