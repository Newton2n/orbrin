"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type QueryValue = string | number | null | undefined;

export function useUrlQueryState() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQuery = useCallback(
    (
      updates: Record<string, QueryValue>,
      mode: "push" | "replace" = "replace",
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;

      if (
        url ===
        `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
      ) {
        return;
      }

      router[mode](url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { searchParams, updateQuery };
}
