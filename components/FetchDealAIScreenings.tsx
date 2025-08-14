"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle } from "lucide-react";
import { DealType, Sentiment } from "@prisma/client";

const AIReasoning = dynamic(() => import("./AiReasoning"), { ssr: false });
import { Button } from "./ui/button";

interface Props {
  dealId: string;
  dealType: DealType;
}

interface Screening {
  id: string;
  title: string;
  explanation: string;
  sentiment: Sentiment;
}

export default function FetchDealAIScreenings({ dealId, dealType }: Props) {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/deals/${dealId}/ai-screenings`);
        if (res.ok) {
          const data = (await res.json()) as Screening[];
          setScreenings(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [dealId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {screenings.length > 0 ? (
        screenings.map((e) => (
          <AIReasoning
            key={e.id}
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