"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Grid, List } from "lucide-react";
import DealCard from "@/components/DealCard";
import DealListItem from "@/components/DealListItem";
import type { Deal, UserRole } from "@prisma/client";
import DeleteDealFromDB from "@/app/actions/delete-deal";

interface DealContainerProps {
  data: Deal[];
  userRole: UserRole;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export default function DealContainer({
  data,
  userRole,
}: DealContainerProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = data.length > 0 && selectedIds.size === data.length;

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(data.map(d => d.id)));
  }
  function toggleOne(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    for (const id of selectedIds) {
      const deal = data.find(d => d.id === id);
      if (deal) await DeleteDealFromDB(deal.dealType, id);
    }
    router.refresh();
    setSelectedIds(new Set());
  }

  function handleBulkScreen() {
    if (!selectedIds.size) return;
    const ids = Array.from(selectedIds).join(",");
    router.push(`/raw-deals/screen?ids=${ids}`);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${
              viewMode === "grid" ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            <Grid className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${
              viewMode === "list" ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            <List className="w-5 h-5 text-white" />
          </button>
        </div>

        {viewMode === "list" && (
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-primary focus:ring-0"
              />
              <span>Select All</span>
            </label>

            <button
              onClick={handleBulkDelete}
              disabled={!selectedIds.size}
              className={`px-4 py-2 rounded ${
                selectedIds.size
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Delete Selected
            </button>

            <button
              onClick={handleBulkScreen}
              disabled={!selectedIds.size}
              className={`px-4 py-2 rounded ${
                selectedIds.size
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Screen Selected
            </button>
          </div>
        )}
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map(deal => (
            <DealCard key={deal.id} deal={deal} userRole={userRole} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-800">
          {data.map(deal => (
            <DealListItem
              key={deal.id}
              deal={deal}
              selected={selectedIds.has(deal.id)}
              onToggle={() => toggleOne(deal.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

