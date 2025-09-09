"use client";

import React, { useState, useEffect } from "react";
import EvaluateDealComponent from "@/components/evaluate-deal-component";
import ScreenerSelector from "./ScreenerSelector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Filter } from "lucide-react";

interface Screener {
  id: string;
  name: string;
}

interface ScreeningWrapperProps {
  dealId: string;
  screeners: Screener[];
}

export default function ScreeningWrapper({
  dealId,
  screeners,
}: ScreeningWrapperProps) {
  const [selectedScreenerId, setSelectedScreenerId] = useState<string>("");

  // Set the first screener as selected by default when screeners are loaded
  useEffect(() => {
    if (screeners && screeners.length > 0 && !selectedScreenerId) {
      setSelectedScreenerId(screeners[0].id);
    }
  }, [screeners, selectedScreenerId]);

  const handleScreenerSelect = (screenerId: string) => {
    setSelectedScreenerId(screenerId);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Evaluate Deal Component - Takes 2/3 of the space */}
      <div className="lg:col-span-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Deal Evaluation
            </CardTitle>
            <CardDescription>
              AI-powered deal analysis and evaluation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedScreenerId ? (
              <EvaluateDealComponent
                dealId={dealId}
                screenerId={selectedScreenerId}
              />
            ) : (
              <div className="flex items-center justify-center py-8">
                <Skeleton className="h-8 w-32" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Screeners - Takes 1/3 of the space */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Available Screeners
            </CardTitle>
            <CardDescription>
              Choose from our collection of screening tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScreenerSelector
              screeners={screeners}
              selectedScreenerId={selectedScreenerId}
              onScreenerSelect={handleScreenerSelect}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
