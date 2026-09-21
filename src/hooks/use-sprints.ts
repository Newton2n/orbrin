"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/hooks/use-projects";

export type SprintStatus = "PLANNING" | "ACTIVE" | "COMPLETED";
export interface Sprint {
  id: string;
  name: string;
  goal?: string | null;
  status: SprintStatus;
  startDate?: string;
  endDate?: string;
  [key: string]: unknown;
}
export interface SprintInput {
  name: string;
  goal?: string;
  status?: SprintStatus;
  startDate?: string;
  endDate?: string;
}

export function useSprints(projectId: string) {
  return useQuery({
    queryKey: ["sprints", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const payload = await apiClient<unknown>(
        `/sprints/projects/${projectId}`,
        {
          params: {
            page: 1,
            limit: 50,
            sortBy: "createdAt",
            sortOrder: "desc",
          },
        },
      );
      const source = (
        payload && typeof payload === "object" ? payload : {}
      ) as Record<string, unknown>;
      const data =
        source.data && typeof source.data === "object"
          ? (source.data as Record<string, unknown>)
          : source;
      const items = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.sprints)
          ? data.sprints
          : Array.isArray(payload)
            ? payload
            : [];
      return {
        items: items as Sprint[],
        total: items.length,
        page: 1,
        limit: 50,
        totalPages: 1,
      } satisfies PaginatedResponse<Sprint>;
    },
  });
}

export function useSprintMutations(projectId: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
  const createSprint = useMutation({
    mutationFn: (input: SprintInput) =>
      apiClient<Sprint>(`/sprints/projects/${projectId}`, {
        method: "POST",
        body: input,
      }),
    onSuccess: invalidate,
  });
  const updateSprint = useMutation({
    mutationFn: ({ id, ...body }: SprintInput & { id: string }) =>
      apiClient<Sprint>(`/sprints/${id}`, { method: "PATCH", body }),
    onSuccess: invalidate,
  });
  const deleteSprint = useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`/sprints/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
  return { createSprint, updateSprint, deleteSprint };
}
