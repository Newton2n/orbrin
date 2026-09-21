"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type ProjectStatus =
  | "ACTIVE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ARCHIVED"
  | string;

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  createdAt?: string;
  documentUrl?: string | null;
  [key: string]: unknown;
}

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  document?: File;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  status?: string;
}

function normalizeList<T>(
  payload: unknown,
  params: ProjectListParams,
): PaginatedResponse<T> {
  const source = (
    payload && typeof payload === "object" ? payload : {}
  ) as Record<string, unknown>;
  const nested =
    source.data && typeof source.data === "object"
      ? (source.data as Record<string, unknown>)
      : source;
  const items = Array.isArray(nested.items)
    ? nested.items
    : Array.isArray(nested.projects)
      ? nested.projects
      : Array.isArray(payload)
        ? payload
        : [];
  const total = Number(nested.total ?? nested.totalCount ?? items.length);
  const page = Number(nested.page ?? params.page ?? 1);
  const limit = Number(nested.limit ?? params.limit ?? 10);
  return {
    items: items as T[],
    total,
    page,
    limit,
    totalPages: Number(
      nested.totalPages ?? Math.max(1, Math.ceil(total / limit)),
    ),
  };
}

function projectFormData(input: CreateProjectInput): FormData {
  const formData = new FormData();
  formData.append("name", input.name);
  if (input.description) formData.append("description", input.description);
  if (input.document) formData.append("document", input.document);
  return formData;
}

export function useProjects(params: ProjectListParams = {}) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: async () =>
      normalizeList<Project>(
        await apiClient("/projects", {
          params: params as Record<string, string | number | undefined>,
        }),
        params,
      ),
    placeholderData: (previous) => previous,
  });
}

export function useProjectMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  const createProject = useMutation({
    mutationFn: (input: CreateProjectInput) =>
      apiClient<Project>("/projects", {
        method: "POST",
        body: projectFormData(input),
      }),
    onSuccess: invalidate,
  });
  const updateProject = useMutation({
    mutationFn: ({ id, ...body }: UpdateProjectInput) =>
      apiClient<Project>(`/projects/${id}`, { method: "PATCH", body }),
    onSuccess: invalidate,
  });
  const deleteProject = useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`/projects/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
  const uploadDocument = useMutation({
    mutationFn: ({ id, document }: { id: string; document: File }) => {
      const body = new FormData();
      body.append("document", document);
      return apiClient<Project>(`/projects/${id}/document`, {
        method: "PATCH",
        body,
      });
    },
    onSuccess: invalidate,
  });
  return { createProject, updateProject, deleteProject, uploadDocument };
}
