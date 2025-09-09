import prismaDB from "@/lib/prisma";
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { DealType } from "@prisma/client";
import AIReasoning from "./AiReasoning";

const FetchDealAIScreenings = async ({
  dealId,
  dealType,
}: {
  dealId: string;
  dealType: DealType;
}) => {
  const screenings = await prismaDB.aiScreening.findMany({
    where: {
      dealId: dealId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  return (
    <div>
      <div>
        {screenings.length > 0 ? (
          screenings.map((e, index) => (
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
    </div>
  );
};

export default FetchDealAIScreenings;
