"use client";

import useSWR from "swr";
import * as React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { Deal } from "@prisma/client";
import { toast } from "sonner";
import axios from "axios";
import { fetcher } from "@/lib/utils";
import { DealScreenersGET } from "@/app/types";

export function BulkScreenDialog({
  deals,
  selectedIds,
}: {
  deals: Deal[];
  selectedIds: string[];
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={!selectedIds.length}>
            Screen Deals
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Screen Selected Deals</DialogTitle>
            <DialogDescription>
              Screen deals to find the best deals.
            </DialogDescription>
          </DialogHeader>
          <BulkScreenComponent deals={deals} selectedIds={selectedIds} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" disabled={!selectedIds.length}>
          Screen Deals
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Screen Selected Deals</DrawerTitle>
          <DrawerDescription>
            Screen deals to find the best deals.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <BulkScreenComponent deals={deals} selectedIds={selectedIds} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function BulkScreenComponent({
  deals,
  selectedIds,
}: {
  deals: Deal[];
  selectedIds: string[];
}) {
  const [isPending, startScreenTransition] = React.useTransition();
  const [selectedScreenerId, setSelectedScreenerId] = React.useState<
    string | null
  >(null);
  const { data, error, isLoading } = useSWR<DealScreenersGET>(
    `/api/deal-screeners`,
    fetcher,
  );

  if (error)
    return (
      <div className="flex items-center justify-center py-6 text-destructive">
        <span>Failed to load screeners.</span>
      </div>
    );
  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6">
        <span className="animate-pulse text-muted-foreground">
          Loading screeners...
        </span>
      </div>
    );

  async function handleBulkScreen() {
    startScreenTransition(async () => {
      if (!selectedIds.length) return;

      if (!selectedScreenerId) {
        toast.error("Please select a screener");
        return;
      }

      const filteredData = deals.filter((d) => selectedIds.includes(d.id));

      try {
        const response = await axios.post(`/api/screen-all`, {
          dealListings: filteredData,
          screenerId: selectedScreenerId,
          screenerContent: data?.find(
            (screener) => screener.id === selectedScreenerId,
          )?.content,
          screenerName: data?.find(
            (screener) => screener.id === selectedScreenerId,
          )?.name,
        });

        if (response.status !== 200) {
          throw new Error("Something went wrong");
        }

        toast.success("Deals Added to Queue");
      } catch (error) {
        console.log(error);

        toast.error("Something went wrong");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="screener-select"
        >
          Select Screener
        </label>
        <select
          id="screener-select"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={selectedScreenerId ?? ""}
          onChange={(e) => setSelectedScreenerId(e.target.value || null)}
        >
          <option value="">Choose a screener...</option>
          {data &&
            data.map((screener) => (
              <option key={screener.id} value={screener.id}>
                {screener.name}
              </option>
            ))}
        </select>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{selectedIds.length}</span> deal
          {selectedIds.length === 1 ? "" : "s"} selected
        </div>
        <Button
          onClick={handleBulkScreen}
          disabled={isPending || !selectedIds.length || !selectedScreenerId}
          className="ml-2"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Screening...
            </span>
          ) : (
            "Screen Deals"
          )}
        </Button>
      </div>
    </div>
  );
}
