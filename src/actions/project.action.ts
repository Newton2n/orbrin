"use server";

import { revalidatePath } from "next/cache";
import {
  actionFailure,
  actionSuccess,
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

export type ProjectActionResult<T> = {
  ok: boolean;
  success: boolean;
  data: T;
  message?: string;
};

export type TeamAssignment = {
  projectId: string;
  teamId: string;
  assignedAt: string;
};

//helper functions for project actions
function projectFailure<T>(message: string, data: T): ProjectActionResult<T> {
  return {
    ok: false,
    success: false,
    message,
    data,
  };
}

function projectSuccess<T>(data: T, message?: string): ProjectActionResult<T> {
  return {
    ok: true,
    success: true,
    message,
    data,
  };
}

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
    return projectFailure(
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
    return projectFailure("Invalid project response from server.", {
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

  return projectSuccess({
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

// export type ProjectStatus = "active" | "inactive" | "completed";

// export type ProjectSprintTask = {
//   id: string;
//   projectId: string;
//   sprintId: string | null;
//   parentTaskId: string | null;
//   creatorId: string | null;
//   assigneeId: string | null;
//   title: string;
//   description: string | null;
//   status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
//   priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
//   dueDate: string | null;
//   deletedAt: string | null;
//   createdAt: string;
//   updatedAt: string;
// };

// export type ProjectSprint = {
//   id: string;
//   projectId: string;
//   name: string;
//   goal: string | null;
//   status: "PLANNING" | "ACTIVE" | "COMPLETED";
//   startDate: string | null;
//   endDate: string | null;
//   deletedAt: string | null;
//   createdAt: string;
//   updatedAt: string;
//   tasks: ProjectSprintTask[];
// };

// export type ProjectTeam = {
//   projectId: string;
//   teamId: string;
//   assignedAt: string;
// };

// export type Project = {
//   id: string;
//   organizationId: string;
//   name: string;
//   description: string | null;
//   documentUrl: string | null;
//   documentPublicId: string | null;
//   status: ProjectStatus;
//   deletedAt: string | null;
//   createdAt: string;
//   updatedAt: string;

//   sprints: ProjectSprint[];
//   teams: ProjectTeam[];
//   tasksWithoutSprint: ProjectSprintTask[];
// };

// export type ProjectActionResult<T> = {
//   ok: boolean;
//   success: boolean;
//   data: T;
//   message?: string;
// };

// const projectFailure = <T = null>(
//   message: string,
//   data: T,
// ): ProjectActionResult<T> => {
//   return {
//     ok: false,
//     success: false,
//     data,
//     message,
//   };
// };

// const projectSuccess = <T>(
//   data: T,
//   message?: string,
// ): ProjectActionResult<T> => {
//   return {
//     ok: true,
//     success: true,
//     data,
//     message,
//   };
// };

// create project

export async function getProjectById(
  projectId: string,
): Promise<ProjectActionResult<Project | null>> {
  if (!projectId) {
    return projectFailure("Project ID is required.", null);
  }

  const result = await backendRequest<unknown>(`/projects/${projectId}`);

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to fetch project."),
      null,
    );
  }

  const project = unwrapPayload<Project>(result.payload);

  if (!project) {
    return projectFailure("Project not found.", null);
  }

  return projectSuccess(
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
    return projectFailure("Project name is required.", null);
  }

  if (!(document instanceof File) || document.size === 0) {
    return projectFailure(
      "A PDF document is required to create a project.",
      null,
    );
  }

  if (document.type !== "application/pdf") {
    return projectFailure("Only PDF documents are allowed.", null);
  }

  const result = await backendRequest<unknown>("/projects", {
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
    return projectFailure("Project ID is required.", null);
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
    return projectFailure("At least one project field is required.", null);
  }

  const result = await backendRequest<unknown>(`/projects/${projectId}`, {
    method: "PATCH",
    body,
  });

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to update project."),
      null,
    );
  }

  revalidateProjectPaths(projectId);

  return projectSuccess(
    unwrapPayload<Project>(result.payload),
    "Project updated successfully.",
  );
}

//delete project
export async function deleteProject(
  projectId: string,
): Promise<ProjectActionResult<Project | null>> {
  if (!projectId) {
    return projectFailure("Project ID is required.", null);
  }

  const result = await backendRequest<unknown>(`/projects/${projectId}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to delete project."),
      null,
    );
  }

  revalidateProjectPaths(projectId);

  return projectSuccess(
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
    return projectFailure("Project ID is required.", null);
  }

  if (!teamId) {
    return projectFailure("Team ID is required.", null);
  }

  const result = await backendRequest<unknown>(`/projects/${projectId}/teams`, {
    method: "POST",
    body: {
      teamId,
    },
  });

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to assign team."),
      null,
    );
  }

  revalidateProjectPaths(projectId);

  return projectSuccess(
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
    return projectFailure("Project ID is required.", null);
  }

  if (!teamId) {
    return projectFailure("Team ID is required.", null);
  }

  const result = await backendRequest<unknown>(
    `/projects/${projectId}/teams/${teamId}`,
    {
      method: "DELETE",
    },
  );

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to remove team from project."),
      null,
    );
  }

  revalidateProjectPaths(projectId);

  return projectSuccess(
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
    return projectFailure("Project ID is required.", null);
  }

  if (!(document instanceof File) || document.size === 0) {
    return projectFailure("A document file is required.", null);
  }

  if (document.type !== "application/pdf") {
    return projectFailure("Only PDF documents are allowed.", null);
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
    return projectFailure(
      backendMessage(result.payload, "Unable to upload project document."),
      null,
    );
  }

  revalidateProjectPaths(projectId);

  return projectSuccess(
    unwrapPayload<Project>(result.payload),
    "Project document uploaded successfully.",
  );
}

//delete project document
export async function deleteProjectDocument(
  projectId: string,
): Promise<ProjectActionResult<null>> {
  if (!projectId) {
    return projectFailure("Project ID is required.", null);
  }

  const result = await backendRequest<null>(`/projects/${projectId}/document`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return projectFailure(
      backendMessage(result.payload, "Unable to delete project document."),
      null,
    );
  }

  revalidateProjectPaths(projectId);

  return projectSuccess(null, "Project document deleted successfully.");
}

//get project teams
export async function getProjectTeams(
  projectId: string,
): Promise<ProjectActionResult<ProjectTeam[]>> {
  const result = await getProjectById(projectId);

  if (!result.ok || !result.data) {
    return projectFailure(
      result.message ?? "Unable to fetch project teams.",
      [],
    );
  }

  return projectSuccess(result.data.teams ?? []);
}
