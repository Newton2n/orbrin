"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/features/auth/api/auth.api";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/store/use-auth-store";

export function useCurrentUser() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    enabled: Boolean(accessToken),
    retry: false,
  });
}
