"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useRef, useTransition, useState } from "react";

import { Loader2, SearchIcon, XCircleIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumberWithCommas } from "@/lib/utils";

export default function SearchRevenueDeals() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isSearching, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(
    formatNumberWithCommas(searchParams.get("revenue") || ""),
  );

  const q = searchParams.get("revenue")?.toString();

  const handleSearch = useDebouncedCallback((query: string) => {
    startTransition(async () => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set("revenue", query);
        params.set("page", "1");
      } else {
        params.delete("revenue");
      }
      replace(`${pathname}?${params.toString()}`);
    });
  }, 300);

  // US-style number formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");
    // Only allow numbers (and optional decimal)
    if (!/^\d*\.?\d*$/.test(rawValue)) return;
    setInputValue(formatNumberWithCommas(rawValue));
    handleSearch(rawValue);
  };

  const handleClearInput = () => {
    setInputValue("");
    handleSearch("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div
      className="relative flex h-8 items-center"
      data-pending={isSearching ? "" : undefined}
    >
      {isSearching ? (
        <Loader2 className="absolute left-2 top-2 size-4 animate-spin text-muted-foreground" />
      ) : (
        <SearchIcon className="absolute left-2 top-2 size-4 text-muted-foreground" />
      )}
      <Input
        className=""
        type="text"
        placeholder="Enter Min Revenue"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            inputRef?.current?.blur();
          }
        }}
        ref={inputRef}
      />
      {q && (
        <Button
          className="absolute right-2 top-2 h-4 w-4"
          onClick={handleClearInput}
          variant={"ghost"}
          size={"icon"}
        >
          <XCircleIcon className="size-5 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
