"use server";

import { revalidatePath } from "next/cache";
import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";

export type SprintStatus = "PLANNING" | "ACTIVE" | "COMPLETED";

export type Sprint = {
  id: string;
  projectId: string;
  name: string;
  goal?: string | null;
  status: SprintStatus;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  tasks?: unknown[];
  project?: unknown;
  [key: string]: unknown;
};

export type SprintListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  status?: SprintStatus;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateSprintInput = {
  name: string;
  goal?: string;
  status?: SprintStatus;
  startDate?: string;
  endDate?: string;
};

export type UpdateSprintInput = Partial<CreateSprintInput>;

const sprintStatuses: SprintStatus[] = ["PLANNING", "ACTIVE", "COMPLETED"];
const sprintPaths = [
  "/dashboard/projects",
  "/dashboard/admin/projects",
  "/dashboard/manager/projects",
  "/dashboard/member/projects",
];

function revalidateSprintPaths(projectId?: string) {
  for (const path of sprintPaths) revalidatePath(path);
  if (!projectId) return;
  revalidatePath(`/dashboard/admin/projects/${projectId}`);
  revalidatePath(`/dashboard/manager/projects/${projectId}`);
  revalidatePath(`/dashboard/member/projects/${projectId}`);
  revalidatePath(`/dashboard/admin/projects/${projectId}/sprints`);
  revalidatePath(`/dashboard/manager/projects/${projectId}/sprints`);
  revalidatePath(`/dashboard/member/projects/${projectId}/sprints`);
}

function normalizeInput(input: CreateSprintInput | UpdateSprintInput) {
  const name = input.name?.trim();
  if (input.name !== undefined && !name) return "Sprint name is required.";
  if (input.status !== undefined && !sprintStatuses.includes(input.status)) {
    return "Invalid sprint status.";
  }
  if (input.startDate && Number.isNaN(Date.parse(input.startDate))) {
    return "Start date must be valid.";
  }
  if (input.endDate && Number.isNaN(Date.parse(input.endDate))) {
    return "End date must be valid.";
  }
  if (input.startDate && input.endDate && input.endDate < input.startDate) {
    return "End date cannot be earlier than start date.";
  }
  return {
    ...input,
    ...(name === undefined ? {} : { name }),
    ...(input.goal === undefined ? {} : { goal: input.goal.trim() }),
    ...(input.startDate ? { startDate: input.startDate } : {}),
    ...(input.endDate ? { endDate: input.endDate } : {}),
  };
}

function normalizeList<T>(
  payload: unknown,
  params: { page?: number; limit?: number },
): PaginatedResponse<T> {
  const raw = payload && typeof payload === "object" ? payload : {};
  const rawRecord = raw as Record<string, unknown>;
  const source = unwrapPayload<unknown>(payload);
  const sourceRecord =
    source && typeof source === "object"
      ? (source as Record<string, unknown>)
      : {};
  const nested =
    sourceRecord.data && typeof sourceRecord.data === "object"
      ? (sourceRecord.data as Record<string, unknown>)
      : sourceRecord;
  const items = Array.isArray(source)
    ? source
    : Array.isArray(nested.items)
      ? nested.items
      : Array.isArray(nested.sprints)
        ? nested.sprints
        : Array.isArray(nested.data)
          ? nested.data
          : Array.isArray(rawRecord.data)
            ? rawRecord.data
            : [];
  const pagination =
    nested.pagination && typeof nested.pagination === "object"
      ? (nested.pagination as Record<string, unknown>)
      : rawRecord.pagination && typeof rawRecord.pagination === "object"
        ? (rawRecord.pagination as Record<string, unknown>)
        : {};
  const total = Number(
    pagination.total ?? nested.total ?? rawRecord.total ?? items.length,
  );
  const limit = Number(
    pagination.limit ?? nested.limit ?? rawRecord.limit ?? params.limit ?? 10,
  );
  const page = Number(
    pagination.page ?? nested.page ?? rawRecord.page ?? params.page ?? 1,
  );
  const totalPages = Number(
    pagination.totalPages ??
      nested.totalPages ??
      rawRecord.totalPages ??
      Math.max(1, Math.ceil(total / Math.max(1, limit))),
  );
  return { items: items as T[], total, page, limit, totalPages };
}

export async function getSprintsByProject(
  projectId: string,
  params: SprintListParams = {},
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const result = await backendRequest<unknown>(
    `/sprints/projects/${projectId}${query.size ? `?${query}` : ""}`,
  );
  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to fetch sprints."),
      {
        items: [],
        total: 0,
        page: 1,
        limit: params.limit ?? 10,
        totalPages: 0,
      },
    );
  }
  return actionSuccess(normalizeList<Sprint>(result.payload, params));
}

export const getSprints = getSprintsByProject;

export async function getSprintById(sprintId: string) {
  const result = await backendRequest<unknown>(`/sprints/${sprintId}`);
  return result.ok
    ? actionSuccess(unwrapPayload<Sprint | null>(result.payload))
    : actionFailure(
        backendMessage(result.payload, "Unable to fetch sprint."),
        null,
      );
}

export async function createSprint(
  projectId: string,
  input: CreateSprintInput,
) {
  const normalized = normalizeInput(input);
  if (typeof normalized === "string") return actionFailure(normalized, null);
  const result = await backendRequest<unknown>(
    `/sprints/projects/${projectId}`,
    { method: "POST", body: normalized },
  );
  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to create sprint."),
      null,
    );
  }
  revalidateSprintPaths(projectId);
  return actionSuccess(
    unwrapPayload<Sprint | null>(result.payload),
    "Sprint created.",
  );
}

export async function updateSprint(sprintId: string, input: UpdateSprintInput) {
  const normalized = normalizeInput(input);
  if (typeof normalized === "string") return actionFailure(normalized, null);
  const result = await backendRequest<unknown>(`/sprints/${sprintId}`, {
    method: "PATCH",
    body: normalized,
  });
  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to update sprint."),
      null,
    );
  }
  const sprint = unwrapPayload<Sprint | null>(result.payload);
  revalidateSprintPaths(sprint?.projectId);
  return actionSuccess(sprint, "Sprint updated.");
}

export async function deleteSprint(sprintId: string, projectId?: string) {
  const result = await backendRequest<null>(`/sprints/${sprintId}`, {
    method: "DELETE",
  });
  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to delete sprint."),
      null,
    );
  }
  revalidateSprintPaths(projectId);
  return actionSuccess(null, "Sprint deleted.");
}
