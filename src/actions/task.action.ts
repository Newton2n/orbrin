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

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  projectId: string;
  sprintId?: string | null;
  parentTaskId?: string | null;
  createdAt: string;
  updatedAt?: string;
  assignee?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
  project?: { id?: string; name?: string } | null;
  [key: string]: unknown;
};

export type TaskListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "title" | "createdAt" | "updatedAt" | string;
  sortOrder?: "asc" | "desc";
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  sprintId?: string;
};

export type TaskInput = Partial<{
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string;
  sprintId: string;
  parentTaskId: string;
}>;

export type Comment = {
  id: string;
  content: string;
  createdAt?: string;
  user?: { fullName?: string };
};

type TaskResult<T> = {
  ok: boolean;
  success: boolean;
  data: T;
  message?: string;
};

function success<T>(data: T, message?: string): TaskResult<T> {
  return { ...actionSuccess(data, message), ok: true };
}

function failure<T>(message: string, data: T): TaskResult<T> {
  return { ...actionFailure(message, data), ok: false };
}

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
      : Array.isArray(nested.data)
        ? nested.data
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

function revalidateTaskPaths(projectId?: string) {
  for (const path of [
    "/dashboard/tasks",
    "/dashboard/admin/tasks",
    "/dashboard/manager/tasks",
    "/dashboard/member/tasks",
    "/dashboard/admin/projects",
    "/dashboard/manager/projects",
    "/dashboard/member/projects",
  ])
    revalidatePath(path);
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
}

function queryString(params: TaskListParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  return query.size ? `?${query}` : "";
}

export async function getProjectTasks(
  projectId: string,
  params: TaskListParams = {},
) {
  const result = await backendRequest<unknown>(
    `/tasks/projects/${projectId}${queryString(params)}`,
  );
  if (!result.ok)
    return failure(backendMessage(result.payload, "Unable to fetch tasks."), {
      items: [],
      total: 0,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      totalPages: 0,
    });
  return success(normalize<Task>(unwrapPayload(result.payload), params));
}

// Kept as an alias for the existing standalone tasks page.
export const getTasks = getProjectTasks;

export async function getTaskById(taskId: string) {
  const result = await backendRequest<Task>(`/tasks/${taskId}`);
  if (!result.ok)
    return failure(
      backendMessage(result.payload, "Unable to fetch task."),
      null,
    );
  return success(unwrapPayload<Task>(result.payload));
}

export async function createTask(
  projectId: string,
  input: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
    assigneeId?: string;
    sprintId?: string;
    parentTaskId?: string;
  },
) {
  const result = await backendRequest<Task>(`/tasks/projects/${projectId}`, {
    method: "POST",
    body: input,
  });
  if (!result.ok)
    return failure(
      backendMessage(result.payload, "Unable to create task."),
      null,
    );
  revalidateTaskPaths(projectId);
  return success(unwrapPayload<Task>(result.payload), "Task created.");
}

export async function updateTask(taskId: string, input: TaskInput) {
  const result = await backendRequest<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: input,
  });
  if (!result.ok)
    return failure(
      backendMessage(result.payload, "Unable to update task."),
      null,
    );
  const task = unwrapPayload<Task>(result.payload);
  revalidateTaskPaths(task.projectId);
  return success(task, "Task updated.");
}

export async function deleteTask(taskId: string) {
  const result = await backendRequest<null>(`/tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!result.ok)
    return failure(
      backendMessage(result.payload, "Unable to delete task."),
      null,
    );
  revalidateTaskPaths();
  return success(null, "Task deleted.");
}

export async function getTaskComments(taskId: string) {
  const result = await backendRequest<unknown>(
    `/comments/tasks/${taskId}?page=1&limit=50&sortBy=createdAt&sortOrder=desc`,
  );
  if (!result.ok)
    return failure(
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
  return success(items as Comment[]);
}

export async function addComment(taskId: string, content: string) {
  const parsed = z.string().trim().min(1).safeParse(content);
  if (!parsed.success) return failure("Comment cannot be empty.", null);
  const result = await backendRequest<Comment>(`/comments/tasks/${taskId}`, {
    method: "POST",
    body: { content: parsed.data },
  });
  if (!result.ok)
    return failure(
      backendMessage(result.payload, "Unable to add comment."),
      null,
    );
  revalidateTaskPaths();
  return success(unwrapPayload<Comment>(result.payload), "Comment added.");
}
