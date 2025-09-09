"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Loader2,
  EyeIcon,
  EyeOffIcon,
  ClockIcon,
  HistoryIcon,
  ListIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchRecentDeals() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isSearching, startTransition] = useTransition();

  const recent = searchParams.get("recent") === "true";

  const handleToggle = () => {
    startTransition(async () => {
      const params = new URLSearchParams(searchParams);
      if (!recent) {
        params.set("recent", "true");
        params.set("page", "1");
      } else {
        params.delete("recent");
      }
      replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div
      className="relative flex h-8 items-center"
      data-pending={isSearching ? "" : undefined}
    >
      {isSearching && (
        <Loader2 className="absolute left-2 top-2 size-4 animate-spin text-muted-foreground" />
      )}
      <Button
        className="h-8 px-3"
        variant={recent ? "default" : "outline"}
        onClick={handleToggle}
        disabled={isSearching}
      >
        {recent ? (
          <>
            <HistoryIcon className="mr-2 size-4" />
            Showing Recent Deals
          </>
        ) : (
          <>
            <ListIcon className="mr-2 size-4" />
            Show Recent Deals
          </>
        )}
      </Button>
    </div>
  );
}
