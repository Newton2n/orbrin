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

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
  documentUrl?: string | null;
  documentPublicId?: string | null;
  teams?: Team[];
  organizationId?: string;
  [key: string]: unknown;
};

export type Team = {
  id: string;
  name: string;
  members?: Array<{ id: string; name?: string; email?: string }>;
  memberCount?: number;
  [key: string]: unknown;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  projectId: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type ProjectListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  status?: string;
  teamId?: string;
};

export type TaskListParams = ProjectListParams & {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  sprintId?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type ProjectActionResult<T> = {
  ok: boolean;
  success: boolean;
  data: T;
  message?: string;
};

function projectFailure<T>(message: string, data: T): ProjectActionResult<T> {
  return { ok: false, success: false, message, data };
}

function projectSuccess<T>(data: T, message?: string): ProjectActionResult<T> {
  return { ok: true, success: true, message, data };
}

const projectPaths = [
  "/dashboard/projects",
  "/dashboard/admin/projects",
  "/dashboard/manager/projects",
  "/dashboard/member/projects",
];

function revalidateProjectPaths(projectId?: string) {
  for (const path of projectPaths) revalidatePath(path);
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
}

// --- Helper ---

function normalizeList<T>(
  payload: unknown,
  params: { page?: number; limit?: number },
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
      : Array.isArray(nested.data)
        ? nested.data
        : Array.isArray(nested.tasks)
          ? nested.tasks
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

// ----------------------
// Project Actions
// ----------------------

export async function getProjects(params: ProjectListParams = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const result = await backendRequest<unknown>(
    `/projects${query.size ? `?${query}` : ""}`,
  );

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to fetch projects."),
      {
        items: [],
        total: 0,
        page: 1,
        limit: params.limit ?? 10,
        totalPages: 0,
      },
    );
  }

  return projectSuccess(
    normalizeList<Project>(unwrapPayload(result.payload), params),
  );
}

export async function getProjectById(id: string) {
  const result = await backendRequest<Project>(`/projects/${id}`);

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to fetch project."),
      null,
    );
  }

  return projectSuccess(unwrapPayload<Project>(result.payload));
}

export async function createProject(formData: FormData) {
  const document = formData.get("document");
  if (!(document instanceof File) || document.size === 0) {
    return projectFailure<Project | null>(
      "A PDF document is required to create a project.",
      null,
    );
  }

  const result = await backendRequest<Project>("/projects", {
    method: "POST",
    body: formData,
  });

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to create project."),
      null,
    );
  }

  revalidateProjectPaths();

  return projectSuccess(
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

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to update project."),
      null,
    );
  }

  revalidateProjectPaths(id);

  return projectSuccess(
    unwrapPayload<Project>(result.payload),
    "Project updated.",
  );
}

export async function deleteProject(id: string) {
  const result = await backendRequest<void>(`/projects/${id}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to delete project."),
      null,
    );
  }

  revalidateProjectPaths(id);

  return projectSuccess(null, "Project deleted.");
}

export async function uploadProjectDocument(id: string, document: File) {
  if (!(document instanceof File) || document.size === 0) {
    return projectFailure<Project | null>("A document file is required.", null);
  }

  const formData = new FormData();
  formData.append("document", document);

  const result = await backendRequest<Project>(`/projects/${id}/document`, {
    method: "PATCH",
    body: formData,
  });

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to upload document."),
      null,
    );
  }

  revalidateProjectPaths(id);

  return projectSuccess(
    unwrapPayload<Project>(result.payload),
    "Document uploaded.",
  );
}

export async function deleteProjectDocument(id: string) {
  const result = await backendRequest<null>(`/projects/${id}/document`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to delete project document."),
      null,
    );
  }

  revalidateProjectPaths(id);
  return projectSuccess(null, "Document deleted.");
}

export async function assignTeamToProject(projectId: string, teamId: string) {
  const result = await backendRequest<Project>(`/projects/${projectId}/teams`, {
    method: "POST",
    body: { teamId },
  });

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to assign team."),
      null,
    );
  }

  revalidateProjectPaths(projectId);
  return projectSuccess(
    unwrapPayload<Project>(result.payload),
    "Team assigned.",
  );
}

export async function removeTeamFromProject(projectId: string, teamId: string) {
  const result = await backendRequest<Project>(
    `/projects/${projectId}/teams/${teamId}`,
    { method: "DELETE" },
  );

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to remove team."),
      null,
    );
  }

  revalidateProjectPaths(projectId);
  return projectSuccess(
    unwrapPayload<Project>(result.payload),
    "Team removed.",
  );
}

export async function getProjectTeams(projectId: string) {
  const result = await getProjectById(projectId);
  if (!result.ok || !result.data) {
    return projectFailure(
      result.message ?? "Unable to fetch project teams.",
      [],
    );
  }

  return projectSuccess(result.data.teams ?? []);
}

// ----------------------
// Task Actions
// ----------------------

export async function getProjectTasks(
  projectId: string,
  params: TaskListParams = {},
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const result = await backendRequest<unknown>(
    `/tasks/projects/${projectId}${query.size ? `?${query}` : ""}`,
  );

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to fetch tasks."),
      {
        items: [],
        total: 0,
        page: 1,
        limit: params.limit ?? 10,
        totalPages: 0,
      },
    );
  }

  return actionSuccess(
    normalizeList<Task>(unwrapPayload(result.payload), params),
  );
}

export async function getTaskById(taskId: string) {
  const result = await backendRequest<Task>(`/tasks/${taskId}`);

  if (!result.ok) {
    return actionFailure<Task | null>(
      backendMessage(result.payload, "Unable to fetch task."),
      null,
    );
  }

  return actionSuccess(unwrapPayload<Task>(result.payload));
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
  },
) {
  const result = await backendRequest<Task>(`/tasks/projects/${projectId}`, {
    method: "POST",
    body: input,
  });

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to create task."),
      null,
    );
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/admin/projects");
  revalidatePath("/dashboard/manager/projects");
  revalidatePath("/dashboard/member/projects");

  return actionSuccess(unwrapPayload<Task>(result.payload), "Task created.");
}

export async function updateTask(
  taskId: string,
  input: Partial<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    assigneeId: string;
    sprintId: string;
  }>,
) {
  const result = await backendRequest<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: input,
  });

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to update task."),
      null,
    );
  }

  revalidatePath(`/dashboard/projects/${input.sprintId ? "" : ""}`); // generic fallback
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/admin/projects");
  revalidatePath("/dashboard/manager/projects");
  revalidatePath("/dashboard/member/projects");

  return actionSuccess(unwrapPayload<Task>(result.payload), "Task updated.");
}

export async function deleteTask(taskId: string) {
  const result = await backendRequest<void>(`/tasks/${taskId}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to delete task."),
      null,
    );
  }

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/admin/projects");
  revalidatePath("/dashboard/manager/projects");
  revalidatePath("/dashboard/member/projects");

  return actionSuccess(null, "Task deleted.");
}
