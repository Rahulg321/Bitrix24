"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Grid, List } from "lucide-react";
import DealCard from "@/components/DealCard";
import DealListItem from "@/components/DealListItem";
import type { Deal, UserRole } from "@prisma/client";
import BulkDeleteDealsFromDb from "@/app/actions/bulk-delete-deals";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";

export interface DealContainerProps {
  data: Deal[];
  userRole: UserRole;
  isAdmin: boolean;
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
  const [isDeleting, startDeleteTransition] = useTransition();

  const allSelected = data.length > 0 && selectedIds.size === data.length;

  function toggleAll() {
    setSelectedIds(
      allSelected ? new Set() : new Set(data.map((d) => d.id))
    );
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    startDeleteTransition(async () => {
      const response = await BulkDeleteDealsFromDb(
        Array.from(selectedIds)
      );
      if (response.type === "success") {
        router.refresh();
        setSelectedIds(new Set());
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  }

  function handleBulkScreen() {
    if (!selectedIds.size) return;
    // your existing screen logic...
  }

  const isAdmin = userRole === "ADMIN";

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        {/* view toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
            aria-label="Grid view"
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
            aria-label="List view"
          >
            <List className="h-5 w-5" />
          </button>
        </div>

        {/* bulk actions (only in list view) */}
        {viewMode === "list" && (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <span>Select All</span>
            </label>

            {/* only admins can delete */}
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={!selectedIds.size}
                  >
                    Delete Selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to delete these?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Continue"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* screen selected stays available to everyone */}
            <button
              onClick={handleBulkScreen}
              disabled={!selectedIds.size}
              className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                selectedIds.size
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              }`}
            >
              Screen Selected
            </button>
          </div>
        )}
      </div>

      {/* deals listing */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              userRole={userRole}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {data.map((deal) => (
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
