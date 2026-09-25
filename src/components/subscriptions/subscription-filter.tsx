
"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  {
    value: "ALL",
    label: "All statuses",
  },
  {
    value: "COMPLETED",
    label: "Paid",
  },
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "FAILED",
    label: "Failed",
  },
  {
    value: "REFUNDED",
    label: "Refunded",
  },
];

export function SubscriptionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";
  const currentStatus = searchParams.get("status") ?? "ALL";

  const [search, setSearch] = useState(currentSearch);

  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "ALL") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Filters should always start from page 1.
      params.delete("page");

      const query = params.toString();

      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const trimmedSearch = search.trim();

    if (trimmedSearch === currentSearch) {
      return;
    }

    const timeout = window.setTimeout(() => {
      updateFilters({
        search: trimmedSearch || null,
      });
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [search, currentSearch, updateFilters]);

  function handleStatusChange(value: string | null) {
    updateFilters({
      status: value,
    });
  }

  function clearFilters() {
    setSearch("");

    router.replace(pathname, {
      scroll: false,
    });
  }

  const hasFilters =
    Boolean(currentSearch) || currentStatus !== "ALL";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search payments..."
          maxLength={100}
          className="pl-9"
        />
      </div>

      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-full sm:w-[170px]">
          <SlidersHorizontal className="mr-2 size-4 text-muted-foreground" />

          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={clearFilters}
          aria-label="Clear filters"
          title="Clear filters"
          className="shrink-0"
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
