"use server";

import { revalidatePath } from "next/cache";

import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";


export type SprintStatus =
  | "PLANNING"
  | "ACTIVE"
  | "COMPLETED";

export type Sprint = {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  startDate: string | null;
  endDate: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Returned by sprint list / sprint details
  tasks?: SprintTask[];
};

export type SprintTask = {
  id: string;
  projectId: string;
  sprintId: string | null;
  parentTaskId: string | null;
  creatorId: string;
  assigneeId: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SprintListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  status?: SprintStatus;
};

export type SprintPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type SprintListResponse = {
  sprints: Sprint[];
  pagination: SprintPagination;
};

export type SprintActionResult<T> = {
  ok: boolean;
  success: boolean;
  data: T;
  message?: string;
};

export type CreateSprintInput = {
  projectId: string;
  name: string;
  goal?: string;
  status?: SprintStatus;
  startDate?: string;
  endDate?: string;
};

export type UpdateSprintInput = {
  sprintId: string;
  name?: string;
  goal?: string;
  status?: SprintStatus;
  startDate?: string;
  endDate?: string;
};

// ============================================================
// Helpers
// ============================================================

function sprintFailure<T>(
  message: string,
  data: T,
): SprintActionResult<T> {
  return {
    ok: false,
    success: false,
    message,
    data,
  };
}

function sprintSuccess<T>(
  data: T,
  message?: string,
): SprintActionResult<T> {
  return {
    ok: true,
    success: true,
    message,
    data,
  };
}

const sprintPaths = [
  "/dashboard/sprints",
  "/dashboard/admin/sprints",
  "/dashboard/manager/sprints",
  "/dashboard/member/sprints",
];

function revalidateSprintPaths(projectId?: string) {
  for (const path of sprintPaths) {
    revalidatePath(path);
  }

  if (projectId) {
    revalidatePath(
      `/dashboard/admin/projects/${projectId}`,
    );

    revalidatePath(
      `/dashboard/manager/projects/${projectId}`,
    );

    revalidatePath(
      `/dashboard/member/projects/${projectId}`,
    );
  }
}

// ============================================================
// CREATE SPRINT
// POST /sprints/projects/:projectId
// ============================================================

export async function createSprint(
  input: CreateSprintInput,
): Promise<SprintActionResult<Sprint | null>> {
  const {
    projectId,
    name,
    goal,
    status,
    startDate,
    endDate,
  } = input;

  if (!projectId) {
    return sprintFailure(
      "Project ID is required.",
      null,
    );
  }

  if (!name?.trim()) {
    return sprintFailure(
      "Sprint name is required.",
      null,
    );
  }

  const body: Record<string, unknown> = {
    name: name.trim(),
  };

  if (goal !== undefined) {
    body.goal = goal;
  }

  if (status !== undefined) {
    body.status = status;
  }

  if (startDate !== undefined) {
    body.startDate = startDate;
  }

  if (endDate !== undefined) {
    body.endDate = endDate;
  }

  const result = await backendRequest<unknown>(
    `/sprints/projects/${projectId}`,
    {
      method: "POST",
      body,
    },
  );

  if (!result.ok) {
    return sprintFailure(
      backendMessage(
        result.payload,
        "Unable to create sprint.",
      ),
      null,
    );
  }

  revalidateSprintPaths(projectId);

  return sprintSuccess(
    unwrapPayload<Sprint>(result.payload),
    "Sprint created successfully.",
  );
}

// ============================================================
// GET SPRINTS BY PROJECT
// GET /sprints/projects/:projectId
//
// Example:
// /sprints/projects/:projectId
// ?page=1
// &limit=10
// &sortBy=createdAt
// &sortOrder=desc
// ============================================================

export async function getSprintsByProject(
  projectId: string,
  params: SprintListParams = {},
): Promise<SprintActionResult<SprintListResponse>> {
  if (!projectId) {
    return sprintFailure(
      "Project ID is required.",
      {
        sprints: [],
        pagination: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    );
  }

  const query = new URLSearchParams();

  query.set(
    "page",
    String(params.page ?? 1),
  );

  query.set(
    "limit",
    String(params.limit ?? 10),
  );

  query.set(
    "sortBy",
    params.sortBy ?? "createdAt",
  );

  query.set(
    "sortOrder",
    params.sortOrder ?? "desc",
  );

  if (params.search?.trim()) {
    query.set(
      "search",
      params.search.trim(),
    );
  }

  if (params.status) {
    query.set(
      "status",
      params.status,
    );
  }

  const endpoint =
    `/sprints/projects/${projectId}?${query.toString()}`;

  const result = await backendRequest<{
    success: boolean;
    message: string;
    data: Sprint[];
    pagination: SprintPagination;
  }>(endpoint);

  console.log("getSprintsByProject result:", result);

  if (!result.ok) {
    return sprintFailure(
      backendMessage(
        result.payload,
        "Unable to fetch sprints.",
      ),
      {
        sprints: [],
        pagination: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    );
  }

  const payload = result.payload;

  if (!payload || typeof payload !== "object") {
    return sprintFailure(
      "Invalid sprint response from server.",
      {
        sprints: [],
        pagination: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    );
  }

  return sprintSuccess({
    sprints: Array.isArray(payload.data)
      ? payload.data
      : [],

    pagination: payload.pagination ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });
}

// ============================================================
// GET SPRINTS
//
// Convenience alias for components that use getSprints.
// ============================================================

export async function getSprints(
  projectId: string,
  params: SprintListParams = {},
) {
  return getSprintsByProject(
    projectId,
    params,
  );
}

// ============================================================
// GET SPRINT BY ID
// GET /sprints/:sprintId
// ============================================================

export async function getSprintById(
  sprintId: string,
): Promise<SprintActionResult<Sprint | null>> {
  if (!sprintId) {
    return sprintFailure(
      "Sprint ID is required.",
      null,
    );
  }

  const result = await backendRequest<unknown>(
    `/sprints/${sprintId}`,
  );

  if (!result.ok) {
    return sprintFailure(
      backendMessage(
        result.payload,
        "Unable to fetch sprint.",
      ),
      null,
    );
  }

  return sprintSuccess(
    unwrapPayload<Sprint>(result.payload),
  );
}

// ============================================================
// UPDATE SPRINT
// PATCH /sprints/:sprintId
// ============================================================

export async function updateSprint(
  input: UpdateSprintInput,
): Promise<SprintActionResult<Sprint | null>> {
  const {
    sprintId,
    name,
    goal,
    status,
    startDate,
    endDate,
  } = input;

  if (!sprintId) {
    return sprintFailure(
      "Sprint ID is required.",
      null,
    );
  }

  const body: Record<string, unknown> = {};

  if (name !== undefined) {
    body.name = name.trim();
  }

  if (goal !== undefined) {
    body.goal = goal;
  }

  if (status !== undefined) {
    body.status = status;
  }

  if (startDate !== undefined) {
    body.startDate = startDate;
  }

  if (endDate !== undefined) {
    body.endDate = endDate;
  }

  if (Object.keys(body).length === 0) {
    return sprintFailure(
      "At least one sprint field is required.",
      null,
    );
  }

  const result = await backendRequest<unknown>(
    `/sprints/${sprintId}`,
    {
      method: "PATCH",
      body,
    },
  );

  if (!result.ok) {
    return sprintFailure(
      backendMessage(
        result.payload,
        "Unable to update sprint.",
      ),
      null,
    );
  }

  revalidateSprintPaths();

  return sprintSuccess(
    unwrapPayload<Sprint>(result.payload),
    "Sprint updated successfully.",
  );
}

// ============================================================
// DELETE SPRINT
// DELETE /sprints/:sprintId
// ============================================================

export async function deleteSprint(
  sprintId: string,
): Promise<SprintActionResult<Sprint | null>> {
  if (!sprintId) {
    return sprintFailure(
      "Sprint ID is required.",
      null,
    );
  }

  const result = await backendRequest<unknown>(
    `/sprints/${sprintId}`,
    {
      method: "DELETE",
    },
  );

  if (!result.ok) {
    return sprintFailure(
      backendMessage(
        result.payload,
        "Unable to delete sprint.",
      ),
      null,
    );
  }

  revalidateSprintPaths();

  return sprintSuccess(
    unwrapPayload<Sprint>(result.payload),
    "Sprint deleted successfully.",
  );
}