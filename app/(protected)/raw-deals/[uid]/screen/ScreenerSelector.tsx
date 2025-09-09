"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, Building2, CheckCircle2 } from "lucide-react";

interface Screener {
  id: string;
  name: string;
}

interface ScreenerSelectorProps {
  screeners: Screener[];
  selectedScreenerId: string;
  onScreenerSelect: (screenerId: string) => void;
}

export default function ScreenerSelector({
  screeners,
  selectedScreenerId,
  onScreenerSelect,
}: ScreenerSelectorProps) {
  if (!screeners || screeners.length === 0) {
    return (
      <div className="py-8 text-center">
        <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No screeners available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {screeners.map((screener, index) => (
          <div key={screener.id}>
            <div
              className={`group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                selectedScreenerId === screener.id
                  ? "border-primary/20 bg-primary/10"
                  : "bg-card hover:bg-accent/50"
              }`}
              onClick={() => onScreenerSelect(screener.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h4
                    className={`text-sm font-medium transition-colors ${
                      selectedScreenerId === screener.id
                        ? "text-primary"
                        : "group-hover:text-primary"
                    }`}
                  >
                    {screener.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    AI-powered screening tool
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {selectedScreenerId === screener.id ? (
                  <Badge variant="default" className="text-xs">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Selected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
            {index < screeners.length - 1 && <Separator className="my-2" />}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 border-t pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {screeners.length}
            </div>
            <div className="text-xs text-muted-foreground">Total Screeners</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {screeners.length}
            </div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
