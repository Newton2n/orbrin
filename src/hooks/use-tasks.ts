"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/hooks/use-projects";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  [key: string]: unknown;
}
export interface TaskListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: TaskStatus;
  priority?: TaskPriority;
}
export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}
export interface Comment {
  id: string;
  content: string;
  createdAt?: string;
  user?: { fullName?: string };
}

function normalize<T>(
  payload: unknown,
  params: TaskListParams,
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

export function useTasks(projectId: string, params: TaskListParams = {}) {
  return useQuery({
    queryKey: ["tasks", projectId, params],
    enabled: Boolean(projectId),
    queryFn: async () =>
      normalize<Task>(
        await apiClient(`/tasks/projects/${projectId}`, {
          params: params as Record<string, string | number | undefined>,
        }),
        params,
      ),
    placeholderData: (previous) => previous,
  });
}

export function useTaskMutations(projectId: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
  const createTask = useMutation({
    mutationFn: (input: TaskInput) =>
      apiClient<Task>(`/tasks/projects/${projectId}`, {
        method: "POST",
        body: input,
      }),
    onSuccess: invalidate,
  });
  const updateTask = useMutation({
    mutationFn: ({ id, ...body }: Partial<TaskInput> & { id: string }) =>
      apiClient<Task>(`/tasks/${id}`, { method: "PATCH", body }),
    onSuccess: invalidate,
  });
  const deleteTask = useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`/tasks/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
  const addComment = useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      apiClient<Comment>(`/comments/tasks/${taskId}`, {
        method: "POST",
        body: { content },
      }),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      }),
  });
  return { createTask, updateTask, deleteTask, addComment };
}

export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: ["comments", taskId],
    enabled: Boolean(taskId),
    queryFn: async () => {
      const payload = await apiClient<unknown>(`/comments/tasks/${taskId}`, {
        params: { page: 1, limit: 50, sortBy: "createdAt", sortOrder: "desc" },
      });
      const source = (
        payload && typeof payload === "object" ? payload : {}
      ) as Record<string, unknown>;
      const data =
        source.data && typeof source.data === "object"
          ? (source.data as Record<string, unknown>)
          : source;
      return (
        Array.isArray(data.items)
          ? data.items
          : Array.isArray(data.comments)
            ? data.comments
            : Array.isArray(payload)
              ? payload
              : []
      ) as Comment[];
    },
  });
}
