"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";
import type { PaginatedResponse } from "./project.action";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  [key: string]: unknown;
};
export type Comment = {
  id: string;
  content: string;
  createdAt?: string;
  user?: { fullName?: string };
};
export type TaskListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: TaskStatus;
  priority?: TaskPriority;
};
export type TaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
};

function normalize<T>(
  payload: unknown,
  params: TaskListParams,
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
    : Array.isArray(nested.tasks)
      ? nested.tasks
      : Array.isArray(payload)
        ? payload
        : [];
  const total = Number(nested.total ?? nested.totalCount ?? items.length);
  const limit = Number(nested.limit ?? params.limit ?? 20);
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

function toQuery(params: TaskListParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (value !== undefined) query.set(key, String(value));
  return query.size ? `?${query}` : "";
}

export async function getTasks(projectId: string, params: TaskListParams = {}) {
  const result = await backendRequest<unknown>(
    `/tasks/projects/${projectId}${toQuery(params)}`,
  );
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to fetch tasks."),
      {
        items: [],
        total: 0,
        page: 1,
        limit: params.limit ?? 20,
        totalPages: 0,
      },
    );
  return actionSuccess(normalize<Task>(unwrapPayload(result.payload), params));
}

export async function createTask(projectId: string, input: TaskInput) {
  return mutate(
    `/tasks/projects/${projectId}`,
    "POST",
    input,
    "Unable to create task.",
  );
}
export async function updateTask(id: string, input: TaskInput) {
  return mutate(`/tasks/${id}`, "PATCH", input, "Unable to update task.");
}
export async function deleteTask(id: string) {
  return mutate(`/tasks/${id}`, "DELETE", undefined, "Unable to delete task.");
}

async function mutate(
  endpoint: string,
  method: string,
  body: unknown,
  fallback: string,
) {
  const result = await backendRequest<Task>(endpoint, { method, body });
  if (!result.ok)
    return actionFailure(backendMessage(result.payload, fallback), null);
  revalidatePath("/dashboard/tasks");
  return actionSuccess(unwrapPayload<Task>(result.payload));
}

export async function getTaskComments(taskId: string) {
  const result = await backendRequest<unknown>(
    `/comments/tasks/${taskId}?page=1&limit=50&sortBy=createdAt&sortOrder=desc`,
  );
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to fetch comments."),
      [] as Comment[],
    );
  const payload = unwrapPayload(result.payload);
  const source =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const items = Array.isArray(source.items)
    ? source.items
    : Array.isArray(source.comments)
      ? source.comments
      : Array.isArray(payload)
        ? payload
        : [];
  return actionSuccess(items as Comment[]);
}

export async function addComment(taskId: string, content: string) {
  const parsed = z.string().trim().min(1).safeParse(content);
  if (!parsed.success) return actionFailure("Comment cannot be empty.", null);
  const result = await backendRequest<Comment>(`/comments/tasks/${taskId}`, {
    method: "POST",
    body: { content: parsed.data },
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to add comment."),
      null,
    );
  revalidatePath("/dashboard/tasks");
  return actionSuccess(
    unwrapPayload<Comment>(result.payload),
    "Comment added.",
  );
}
