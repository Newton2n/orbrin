"use server";

import { revalidatePath } from "next/cache";
import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";

export type ProjectStatus =
  | "ACTIVE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ARCHIVED"
  | string;
export type Project = {
  id: string;
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  createdAt?: string;
  documentUrl?: string | null;
  [key: string]: unknown;
};
export type ProjectListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
};
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function normalizeList<T>(
  payload: unknown,
  params: ProjectListParams,
): PaginatedResponse<T> {
  const source =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
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
  const limit = Number(nested.limit ?? params.limit ?? 10);
  return {
    items: items as T[],
    total,
    page: Number(nested.page ?? params.page ?? 1),
    limit,
    totalPages: Number(
      nested.totalPages ?? Math.max(1, Math.ceil(total / limit)),
    ),
  };
}

export async function getProjects(params: ProjectListParams = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (value !== undefined) query.set(key, String(value));
  const result = await backendRequest<unknown>(
    `/projects${query.size ? `?${query}` : ""}`,
  );
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to fetch projects."),
      {
        items: [],
        total: 0,
        page: 1,
        limit: params.limit ?? 10,
        totalPages: 0,
      },
    );
  return actionSuccess(
    normalizeList<Project>(unwrapPayload(result.payload), params),
  );
}

export async function createProject(formData: FormData) {
  const result = await backendRequest<Project>("/projects", {
    method: "POST",
    body: formData,
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to create project."),
      null,
    );
  revalidatePath("/dashboard/projects");
  return actionSuccess(
    unwrapPayload<Project>(result.payload),
    "Project created.",
  );
}

export async function updateProject(input: {
  id: string;
  name?: string;
  description?: string;
  status?: string;
}) {
  const { id, ...body } = input;
  const result = await backendRequest<Project>(`/projects/${id}`, {
    method: "PATCH",
    body,
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to update project."),
      null,
    );
  revalidatePath("/dashboard/projects");
  return actionSuccess(
    unwrapPayload<Project>(result.payload),
    "Project updated.",
  );
}

export async function deleteProject(id: string) {
  const result = await backendRequest<void>(`/projects/${id}`, {
    method: "DELETE",
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to delete project."),
      null,
    );
  revalidatePath("/dashboard/projects");
  return actionSuccess(null, "Project deleted.");
}

export async function uploadProjectDocument(id: string, document: File) {
  const formData = new FormData();
  formData.append("document", document);
  const result = await backendRequest<Project>(`/projects/${id}/document`, {
    method: "PATCH",
    body: formData,
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to upload document."),
      null,
    );
  revalidatePath("/dashboard/projects");
  return actionSuccess(
    unwrapPayload<Project>(result.payload),
    "Document uploaded.",
  );
}
