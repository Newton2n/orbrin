"use server";

import { revalidatePath } from "next/cache";

import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskProject = {
  id: string;
  name: string;
};

export type TaskUser = {
  id: string;
  fullName: string;
  profileImageUrl?: string | null;
  email: string;
};

export type Task = {
  id: string;
  projectId: string;
  sprintId: string | null;
  parentTaskId: string | null;
  creatorId: string | null;
  assigneeId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  project?: TaskProject | null;
  assignee?: TaskUser | null;
};

export type TaskPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type TaskListResponse = {
  tasks: Task[];
  pagination: TaskPagination;
};

export type TaskActionResult<T> = {
  ok: boolean;
  success: boolean;
  data: T;
  message?: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: Extract<TaskStatus, "TODO" | "IN_PROGRESS" | "DONE">;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  sprintId?: string;
  parentTaskId?: string;
};

export type UpdateTaskInput = {
  taskId: string;
  title?: string;
  description?: string;
  status?: Extract<TaskStatus, "TODO" | "IN_PROGRESS" | "DONE">;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  sprintId?: string;
  parentTaskId?: string;
};

export type TaskQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  sprintId?: string;
  sortBy?: "title" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

const taskFailure = <T = never>(message: string): TaskActionResult<T> => {
  return actionFailure(message, undefined) as TaskActionResult<T>;
};

const taskSuccess = <T>(data: T, message?: string): TaskActionResult<T> => {
  return actionSuccess(data, message) as TaskActionResult<T>;
};

const buildQueryString = (params?: TaskQueryParams) => {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.priority) {
    searchParams.set("priority", params.priority);
  }

  if (params.assigneeId) {
    searchParams.set("assigneeId", params.assigneeId);
  }

  if (params.sprintId) {
    searchParams.set("sprintId", params.sprintId);
  }

  if (params.sortBy) {
    searchParams.set("sortBy", params.sortBy);
  }

  if (params.sortOrder) {
    searchParams.set("sortOrder", params.sortOrder);
  }

  const query = searchParams.toString();

  return query ? `?${query}` : "";
};

// Get project tasks
export const getTasksByProject = async (
  projectId: string,
  params?: TaskQueryParams,
): Promise<TaskActionResult<TaskListResponse>> => {
  const endpoint = `/tasks/projects/${projectId}${buildQueryString(params)}`;

  const result = await backendRequest<unknown>(endpoint);

  if (!result.ok) {
    return taskFailure(
      backendMessage(result.payload, "Unable to load project tasks."),
    );
  }

  const payload = result.payload as {
    data?: unknown;
    pagination?: TaskPagination;
    message?: string;
  };

  const tasks = Array.isArray(payload.data) ? (payload.data as Task[]) : [];

  return taskSuccess(
    {
      tasks,
      pagination: payload.pagination ?? {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        total: tasks.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
    payload.message,
  );
};

// Get assigned tasks
export const getMyTasks = async (
  params?: TaskQueryParams,
): Promise<TaskActionResult<TaskListResponse>> => {
  const endpoint = `/tasks/my-tasks${buildQueryString(params)}`;

  const result = await backendRequest<unknown>(endpoint);

  if (!result.ok) {
    return taskFailure(
      backendMessage(result.payload, "Unable to load your assigned tasks."),
    );
  }

  const payload = result.payload as {
    message?: string;
    data?: unknown;
    pagination?: TaskPagination;
  };

  const tasks: Task[] = Array.isArray(payload.data)
    ? (payload.data as Task[])
    : [];

  const pagination: TaskPagination = payload.pagination ?? {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
    total: tasks.length,
    totalPages: tasks.length > 0 ? 1 : 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  return taskSuccess(
    {
      tasks,
      pagination,
    },
    payload.message ?? "Assigned tasks retrieved successfully.",
  );
};

// Get created tasks
export const getMyCreatedTasks = async (
  params?: TaskQueryParams,
): Promise<TaskActionResult<TaskListResponse>> => {
  const endpoint = `/tasks/created-tasks${buildQueryString(params)}`;

  const result = await backendRequest<unknown>(endpoint);

  if (!result.ok) {
    return taskFailure(
      backendMessage(result.payload, "Unable to load your created tasks."),
    );
  }

  const payload = result.payload as {
    message?: string;
    data?: unknown;
    pagination?: TaskPagination;
  };

  const tasks: Task[] = Array.isArray(payload.data)
    ? (payload.data as Task[])
    : [];

  const pagination: TaskPagination = payload.pagination ?? {
    page: params?.page ?? 1,
    limit: params?.limit ?? 10,
    total: tasks.length,
    totalPages: tasks.length > 0 ? 1 : 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  return taskSuccess(
    {
      tasks,
      pagination,
    },
    payload.message ?? "Created tasks retrieved successfully.",
  );
};

// Get one task
export const getTaskById = async (
  taskId: string,
): Promise<TaskActionResult<Task>> => {
  const result = await backendRequest<unknown>(`/tasks/${taskId}`);

  if (!result.ok) {
    return taskFailure(backendMessage(result.payload, "Unable to load task."));
  }

  const task = unwrapPayload<Task>(result.payload);

  if (!task) {
    return taskFailure("Task was not found.");
  }

  return taskSuccess(task);
};

// Create task
export const createTask = async (
  projectId: string,
  input: CreateTaskInput,
): Promise<TaskActionResult<Task>> => {
  const result = await backendRequest<unknown>(`/tasks/projects/${projectId}`, {
    method: "POST",
    body: input,
  });

  if (!result.ok) {
    return taskFailure(
      backendMessage(result.payload, "Unable to create task."),
    );
  }

  const task = unwrapPayload<Task>(result.payload);

  if (!task) {
    return taskFailure("Task could not be created.");
  }

  revalidatePath("/dashboard/admin/tasks");
  revalidatePath("/dashboard/manager/tasks");
  revalidatePath("/dashboard/member/tasks");

  return taskSuccess(
    task,
    backendMessage(result.payload, "Task created successfully."),
  );
};

// Update task
export const updateTask = async (
  input: UpdateTaskInput,
): Promise<TaskActionResult<Task>> => {
  const { taskId, ...body } = input;

  const result = await backendRequest<unknown>(`/tasks/${taskId}`, {
    method: "PATCH",
    body,
  });

  if (!result.ok) {
    return taskFailure(
      backendMessage(result.payload, "Unable to update task."),
    );
  }

  const task = unwrapPayload<Task>(result.payload);

  if (!task) {
    return taskFailure("Task could not be updated.");
  }

  revalidatePath("/dashboard/admin/tasks");
  revalidatePath("/dashboard/manager/tasks");
  revalidatePath("/dashboard/member/tasks");

  return taskSuccess(
    task,
    backendMessage(result.payload, "Task updated successfully."),
  );
};

// Delete task
export const deleteTask = async (
  taskId: string,
): Promise<TaskActionResult<Task>> => {
  const result = await backendRequest<unknown>(`/tasks/${taskId}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return taskFailure(
      backendMessage(result.payload, "Unable to delete task."),
    );
  }

  const task = unwrapPayload<Task>(result.payload);

  if (!task) {
    return taskFailure("Task could not be deleted.");
  }

  revalidatePath("/dashboard/admin/tasks");
  revalidatePath("/dashboard/manager/tasks");
  revalidatePath("/dashboard/member/tasks");

  return taskSuccess(
    task,
    backendMessage(result.payload, "Task deleted successfully."),
  );
};
