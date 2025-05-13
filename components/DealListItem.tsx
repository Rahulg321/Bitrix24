import React from "react";
import Link from "next/link";
import type { Deal } from "@prisma/client";

interface Props {
  deal: Deal;
  selected: boolean;
  onToggle: () => void;
}

export default function DealListItem({ deal, selected, onToggle }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-800">
      <div className="flex items-center flex-1 space-x-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-primary focus:ring-0"
        />
        <div>
          <h3 className="text-lg font-semibold text-white">
            {deal.dealCaption}
          </h3>
          <div className="text-sm text-gray-400">
            Revenue: ${deal.revenue} · EBITDA: ${deal.ebitda} ·{" "}
            {deal.industry || "—"}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 flex space-x-2">
        <Link
          href={`/raw-deals/${deal.id}`}
          className="px-4 py-2 bg-gray-100 text-black rounded"
        >
          View Details
        </Link>
        <Link
          href={`/raw-deals/${deal.id}/screen`}
          className="px-4 py-2 border border-gray-600 text-gray-300 rounded"
        >
          Screen Deal
        </Link>
      </div>
    </div>
  );
}

