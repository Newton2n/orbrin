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
  [key: string]: unknown;
};
export type SprintInput = {
  name: string;
  goal?: string;
  status?: SprintStatus;
  startDate?: string;
  endDate?: string;
};

export async function getSprints(projectId: string) {
  const result = await backendRequest<unknown>(
    `/sprints/projects/${projectId}?page=1&limit=50&sortBy=createdAt&sortOrder=desc`,
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
  const items = Array.isArray(source.items)
    ? source.items
    : Array.isArray(source.sprints)
      ? source.sprints
      : Array.isArray(payload)
        ? payload
        : [];
  return actionSuccess({
    items: items as Sprint[],
    total: items.length,
    page: 1,
    limit: 50,
    totalPages: 1,
  } satisfies PaginatedResponse<Sprint>);
}

export async function createSprint(projectId: string, input: SprintInput) {
  return mutate(
    `/sprints/projects/${projectId}`,
    "POST",
    input,
    "Unable to create sprint.",
  );
}
export async function updateSprint(id: string, input: SprintInput) {
  return mutate(`/sprints/${id}`, "PATCH", input, "Unable to update sprint.");
}
export async function deleteSprint(id: string) {
  return mutate(
    `/sprints/${id}`,
    "DELETE",
    undefined,
    "Unable to delete sprint.",
  );
}

async function mutate(
  endpoint: string,
  method: string,
  body: unknown,
  fallback: string,
) {
  const result = await backendRequest<Sprint>(endpoint, { method, body });
  if (!result.ok)
    return actionFailure(backendMessage(result.payload, fallback), null);
  revalidatePath("/dashboard/tasks");
  return actionSuccess(
    result.payload ? unwrapPayload<Sprint>(result.payload) : null,
  );
}
