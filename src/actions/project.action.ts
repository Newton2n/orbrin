"use server";

import { revalidatePath } from "next/cache";
import {
  actionFailure,
  actionSuccess,
  type ActionResult,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Team = {
  id: string;
  name: string;
  description?: string | null;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
};
export type ProjectStatus =
  | "active"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ARCHIVED"
  | string;

export type Project = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  documentUrl: string | null;
  documentPublicId: string | null;
  status: ProjectStatus;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Returned by project list / project details
  teams?: ProjectTeam[];
  tasks?: ProjectTask[];
};

export type ProjectTeam = {
  projectId: string;
  teamId: string;
  assignedAt: string;
};

export type ProjectTask = {
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

export type ProjectListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  teamId?: string;
};

export type ProjectPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ProjectListResponse = {
  projects: Project[];
  pagination: ProjectPagination;
};

export type ProjectActionResult<T> = ActionResult<T>;

export type TeamAssignment = {
  projectId: string;
  teamId: string;
  assignedAt: string;
};

const projectPaths = [
  "/dashboard/projects",
  "/dashboard/admin/projects",
  "/dashboard/manager/projects",
  "/dashboard/member/projects",
];

function revalidateProjectPaths(projectId?: string) {
  for (const path of projectPaths) {
    revalidatePath(path);
  }

  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}`);
  }
}

//get all projects
export async function getAllProjects(
  params: ProjectListParams = {},
): Promise<ProjectActionResult<ProjectListResponse>> {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const endpoint = `/projects${query.toString() ? `?${query}` : ""}`;

  const result = await backendRequest<{
    success: boolean;
    message: string;
    data: Project[];
    pagination: ProjectPagination;
  }>(endpoint);

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to fetch projects."),
      {
        projects: [],
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
    return actionFailure("Invalid project response from server.", {
      projects: [],
      pagination: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }

  return actionSuccess({
    projects: Array.isArray(payload.data) ? payload.data : [],
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


// create project

export async function getProjectById(
  projectId: string,
): Promise<ProjectActionResult<Project | null>> {
  if (!projectId) {
    return actionFailure("Project ID is required.", null);
  }

  const result = await backendRequest<unknown>(`/projects/${projectId}`);

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to fetch project."),
      null,
    );
  }

  const project = unwrapPayload<Project>(result.payload);

  if (!project) {
    return actionFailure("Project not found.", null);
  }

  return actionSuccess(
    project,
    backendMessage(result.payload, "Project retrieved successfully."),
  );
}

//create project
export async function createProject(
  formData: FormData,
): Promise<ProjectActionResult<Project | null>> {
  const name = formData.get("name");
  const description = formData.get("description");
  const document = formData.get("document");

  if (typeof name !== "string" || !name.trim()) {
    return actionFailure("Project name is required.", null);
  }

  if (!(document instanceof File) || document.size === 0) {
    return actionFailure(
      "A PDF document is required to create a project.",
      null,
    );
  }

  if (document.type !== "application/pdf") {
    return actionFailure("Only PDF documents are allowed.", null);
  }

  const result = await backendRequest<unknown>("/projects", {
    method: "POST",
    body: formData,
  });

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to create project."),
      null,
    );
  }

  revalidateProjectPaths();

  return actionSuccess(
    unwrapPayload<Project>(result.payload),
    "Project created successfully.",
  );
}

export type UpdateProjectInput = {
  projectId: string;
  name?: string;
  description?: string;
  status?: string;
};

//update project
export async function updateProject(
  input: UpdateProjectInput,
): Promise<ProjectActionResult<Project | null>> {
  const { projectId, name, description, status } = input;

  if (!projectId) {
    return actionFailure("Project ID is required.", null);
  }

  const body: Record<string, string> = {};

  if (name !== undefined) {
    body.name = name;
  }

  if (description !== undefined) {
    body.description = description;
  }

  if (status !== undefined) {
    body.status = status;
  }

  if (Object.keys(body).length === 0) {
    return actionFailure("At least one project field is required.", null);
  }

  const result = await backendRequest<unknown>(`/projects/${projectId}`, {
    method: "PATCH",
    body,
  });

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to update project."),
      null,
    );
  }

  revalidateProjectPaths(projectId);

  return actionSuccess(
    unwrapPayload<Project>(result.payload),
    "Project updated successfully.",
  );
}

//delete project
export async function deleteProject(
  projectId: string,
): Promise<ProjectActionResult<Project | null>> {
  if (!projectId) {
    return actionFailure("Project ID is required.", null);
  }

  const result = await backendRequest<unknown>(`/projects/${projectId}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to delete project."),
      null,
    );
  }

  revalidateProjectPaths(projectId);

  return actionSuccess(
    unwrapPayload<Project>(result.payload),
    "Project deleted successfully.",
  );
}

//assign team to project
export async function assignTeamToProject(
  projectId: string,
  teamId: string,
): Promise<ProjectActionResult<TeamAssignment | null>> {
  if (!projectId) {
    return actionFailure("Project ID is required.", null);
  }

  if (!teamId) {
    return actionFailure("Team ID is required.", null);
  }

  const result = await backendRequest<unknown>(`/projects/${projectId}/teams`, {
    method: "POST",
    body: {
      teamId,
    },
  });

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to assign team."),
      null,
    );
  }

  revalidateProjectPaths(projectId);

  return actionSuccess(
    unwrapPayload<TeamAssignment>(result.payload),
    "Team assigned successfully.",
  );
}

//remove team from project
export async function removeTeamFromProject(
  projectId: string,
  teamId: string,
): Promise<ProjectActionResult<TeamAssignment | null>> {
  if (!projectId) {
    return actionFailure("Project ID is required.", null);
  }

  if (!teamId) {
    return actionFailure("Team ID is required.", null);
  }

  const result = await backendRequest<unknown>(
    `/projects/${projectId}/teams/${teamId}`,
    {
      method: "DELETE",
    },
  );

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to remove team from project."),
      null,
    );
  }

  revalidateProjectPaths(projectId);

  return actionSuccess(
    unwrapPayload<TeamAssignment>(result.payload),
    "Team removed successfully.",
  );
}

//upload project document
export async function uploadProjectDocument(
  projectId: string,
  document: File,
): Promise<ProjectActionResult<Project | null>> {
  if (!projectId) {
    return actionFailure("Project ID is required.", null);
  }

  if (!(document instanceof File) || document.size === 0) {
    return actionFailure("A document file is required.", null);
  }

  if (document.type !== "application/pdf") {
    return actionFailure("Only PDF documents are allowed.", null);
  }

  const formData = new FormData();
  formData.append("document", document);

  const result = await backendRequest<unknown>(
    `/projects/${projectId}/document`,
    {
      method: "PATCH",
      body: formData,
    },
  );

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to upload project document."),
      null,
    );
  }

  revalidateProjectPaths(projectId);

  return actionSuccess(
    unwrapPayload<Project>(result.payload),
    "Project document uploaded successfully.",
  );
}

//delete project document
export async function deleteProjectDocument(
  projectId: string,
): Promise<ProjectActionResult<null>> {
  if (!projectId) {
    return actionFailure("Project ID is required.", null);
  }

  const result = await backendRequest<null>(`/projects/${projectId}/document`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to delete project document."),
      null,
    );
  }

  revalidateProjectPaths(projectId);

  return actionSuccess(null, "Project document deleted successfully.");
}

//get project teams
export async function getProjectTeams(
  projectId: string,
): Promise<ProjectActionResult<ProjectTeam[]>> {
  const result = await getProjectById(projectId);

  if (!result.ok || !result.data) {
    return actionFailure(
      result.message ?? "Unable to fetch project teams.",
      [],
    );
  }

  return actionSuccess(result.data.teams ?? []);
}
