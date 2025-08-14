import React from "react";
import Link from "next/link";
import type { Deal } from "@prisma/client";
import { ScrollArea } from "./ui/scroll-area";

interface Props {
  deal: Deal;
  selected: boolean;
  onToggle: () => void;
}

export default function DealListItem({ deal, selected, onToggle }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50">
      <div className="flex flex-1 items-center gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        <div className="space-y-6">
          <div className="space-y-2">
            <ScrollArea className="h-12">
              <span className="font-semibold text-foreground">
                {deal.title}
              </span>
            </ScrollArea>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <p>Brokerage: {deal.brokerage}</p>
            <p>
              Name: {deal.firstName} {deal.lastName}
            </p>
            <p>Email: {deal.email}</p>
            <p>Status: {deal.status}</p>
            <p>Reviewed: {deal.reviewed ? "Yes" : "No"}</p>
            <p>Published: {deal.published ? "Yes" : "No"}</p>
            <p>LinkedIn: {deal.linkedinUrl}</p>
            <p>Phone: {deal.workPhone}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Revenue:</span>
            <span className="font-medium text-foreground">${deal.revenue}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">EBITDA:</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary">
              ${deal.ebitda}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Industry:</span>
            <span className="font-medium text-foreground">
              {deal.industry || "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-shrink-0">
        <Link
          href={`/raw-deals/${deal.id}`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
