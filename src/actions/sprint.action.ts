"use server";

import { revalidatePath } from "next/cache";
import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";
import type { PaginatedResponse } from "./project.action";

export type SprintStatus = "PLANNING" | "ACTIVE" | "COMPLETED";
export type Sprint = {
  id: string;
  name: string;
  goal?: string | null;
  status: SprintStatus;
  startDate?: string;
  endDate?: string;
  projectId: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};
export type SprintInput = {
  name: string;
  goal?: string;
  status?: SprintStatus;
  startDate?: string;
  endDate?: string;
};

export type SprintListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt" | "updatedAt" | string;
  sortOrder?: "asc" | "desc";
  status?: SprintStatus;
};

function revalidateSprintPaths(projectId?: string) {
  for (const path of [
    "/dashboard/projects",
    "/dashboard/admin/projects",
    "/dashboard/manager/projects",
    "/dashboard/member/projects",
  ])
    revalidatePath(path);
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function getSprintsByProject(
  projectId: string,
  params: SprintListParams = {},
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries({
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...params,
  })) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const result = await backendRequest<unknown>(
    `/sprints/projects/${projectId}?${query}`,
  );
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to fetch sprints."),
      { items: [], total: 0, page: 1, limit: 50, totalPages: 0 },
    );
  const payload = unwrapPayload(result.payload);
  const source =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const nested =
    source.data && typeof source.data === "object"
      ? (source.data as Record<string, unknown>)
      : source;
  const items = Array.isArray(source.items)
    ? source.items
    : Array.isArray(nested.items)
      ? nested.items
      : Array.isArray(nested.sprints)
        ? nested.sprints
        : Array.isArray(payload)
          ? payload
          : [];
  const total = Number(nested.total ?? nested.totalCount ?? items.length);
  const limit = Number(nested.limit ?? params.limit ?? 50);
  return actionSuccess({
    items: items as Sprint[],
    total,
    page: Number(nested.page ?? params.page ?? 1),
    limit,
    totalPages: Number(
      nested.totalPages ?? Math.max(1, Math.ceil(total / limit)),
    ),
  } satisfies PaginatedResponse<Sprint>);
}

export const getSprints = getSprintsByProject;

export async function getSprintById(sprintId: string) {
  const result = await backendRequest<Sprint>(`/sprints/${sprintId}`);
  return result.ok
    ? actionSuccess(unwrapPayload<Sprint>(result.payload))
    : actionFailure(
        backendMessage(result.payload, "Unable to fetch sprint."),
        null,
      );
}

export async function createSprint(projectId: string, input: SprintInput) {
  const result = await backendRequest<Sprint>(
    `/sprints/projects/${projectId}`,
    { method: "POST", body: input },
  );
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to create sprint."),
      null,
    );
  revalidateSprintPaths(projectId);
  return actionSuccess(
    unwrapPayload<Sprint>(result.payload),
    "Sprint created.",
  );
}
export async function updateSprint(id: string, input: Partial<SprintInput>) {
  const result = await backendRequest<Sprint>(`/sprints/${id}`, {
    method: "PATCH",
    body: input,
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to update sprint."),
      null,
    );
  const sprint = unwrapPayload<Sprint>(result.payload);
  revalidateSprintPaths(sprint.projectId);
  return actionSuccess(sprint, "Sprint updated.");
}
export async function deleteSprint(id: string) {
  const result = await backendRequest<null>(`/sprints/${id}`, {
    method: "DELETE",
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to delete sprint."),
      null,
    );
  revalidateSprintPaths();
  return actionSuccess(null, "Sprint deleted.");
}
