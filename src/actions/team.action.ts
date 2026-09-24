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

export type TeamMemberRole = "MANAGER" | "MEMBER" | "ADMIN";

export type TeamMemberStatus = "ACTIVE" | "INACTIVE";

export type TeamMembership = {
  teamId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type TeamMember = {
  createdAt: string;
  id: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  updatedAt: string;

  user: {
    email: string;
    emailVerified: boolean;
    fullName: string;
    id: string;
    status: TeamMemberStatus;
  };
};

export type Team = {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  teamMembers?: TeamMembership[];

  projects?: unknown[];
};

export type TeamListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export type TeamActionResult<T> = {
  ok: boolean;
  success: boolean;
  data: T;
  message?: string;
};

function success<T>(data: T, message?: string): TeamActionResult<T> {
  return {
    ...actionSuccess(data, message),
    ok: true,
  };
}

function failure<T>(message: string, data: T): TeamActionResult<T> {
  return {
    ...actionFailure(message, data),
    ok: false,
  };
}

function normalizeList<T>(
  payload: unknown,
  params: TeamListParams,
): PaginatedResponse<T> {
  const source =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  const data =
    source.data && typeof source.data === "object"
      ? (source.data as Record<string, unknown>)
      : null;

  const pagination =
    source.pagination && typeof source.pagination === "object"
      ? (source.pagination as Record<string, unknown>)
      : {};

  const rawItems = Array.isArray(source.data)
    ? source.data
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.teams)
        ? data.teams
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(source.items)
            ? source.items
            : Array.isArray(source.teams)
              ? source.teams
              : [];

  const items = rawItems as T[];

  const total = Number(
    pagination.total ?? source.total ?? data?.total ?? items.length,
  );

  const limit = Number(
    pagination.limit ?? source.limit ?? data?.limit ?? params.limit ?? 10,
  );

  const page = Number(
    pagination.page ?? source.page ?? data?.page ?? params.page ?? 1,
  );

  const totalPages = Number(
    pagination.totalPages ??
      source.totalPages ??
      data?.totalPages ??
      Math.max(1, Math.ceil(total / limit)),
  );

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

const teamPaths = [
  "/dashboard/admin/teams",
  "/dashboard/manager/teams",
  "/dashboard/member/teams",
];

function revalidateTeamPaths() {
  for (const path of teamPaths) {
    revalidatePath(path);
  }
}

// Get teams
export async function getTeams(params: TeamListParams = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const result = await backendRequest<unknown>(
    `/teams${query.size ? `?${query}` : ""}`,
  );

  if (!result.ok) {
    return failure(backendMessage(result.payload, "Unable to fetch teams."), {
      items: [],
      total: 0,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      totalPages: 0,
    });
  }

  return success(normalizeList<Team>(result.payload, params));
}

// Get team by ID
export async function getTeamById(id: string) {
  const result = await backendRequest<Team>(`/teams/${id}`);

  if (!result.ok) {
    return failure(
      backendMessage(result.payload, "Unable to fetch team."),
      null,
    );
  }

  return success(unwrapPayload<Team>(result.payload));
}

// Create team
export async function createTeam(input: {
  name: string;
  description?: string;
}) {
  const result = await backendRequest<Team>("/teams", {
    method: "POST",
    body: input,
  });

  if (!result.ok) {
    return failure(
      backendMessage(result.payload, "Unable to create team."),
      null,
    );
  }

  revalidateTeamPaths();

  return success(unwrapPayload<Team>(result.payload), "Team created.");
}

// Update team
export async function updateTeam(
  id: string,
  input: {
    name?: string;
    description?: string;
  },
) {
  const result = await backendRequest<Team>(`/teams/${id}`, {
    method: "PATCH",
    body: input,
  });

  if (!result.ok) {
    return failure(
      backendMessage(result.payload, "Unable to update team."),
      null,
    );
  }

  revalidateTeamPaths();

  return success(unwrapPayload<Team>(result.payload), "Team updated.");
}

// Delete team
export async function deleteTeam(id: string) {
  const result = await backendRequest<null>(`/teams/${id}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return failure(
      backendMessage(result.payload, "Unable to delete team."),
      null,
    );
  }

  revalidateTeamPaths();

  return success(null, "Team deleted.");
}

// Team Members
export async function getTeamMembers(teamId: string) {
  const result = await backendRequest<unknown>(`/teams/${teamId}/members`);

  if (!result.ok) {
    return failure(
      backendMessage(result.payload, "Unable to fetch team members."),
      [],
    );
  }

  const payload = unwrapPayload<unknown>(result.payload);

  const members = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === "object" &&
        Array.isArray((payload as Record<string, unknown>).members)
      ? (payload as Record<string, unknown>).members
      : payload &&
          typeof payload === "object" &&
          Array.isArray((payload as Record<string, unknown>).items)
        ? (payload as Record<string, unknown>).items
        : payload &&
            typeof payload === "object" &&
            Array.isArray((payload as Record<string, unknown>).data)
          ? (payload as Record<string, unknown>).data
          : [];

  return success(members as TeamMember[]);
}

// Add team member
export async function addTeamMember(teamId: string, userId: string) {
  const result = await backendRequest<TeamMember>(`/teams/${teamId}/members`, {
    method: "POST",
    body: {
      userId,
    },
  });

  if (!result.ok) {
    return failure(
      backendMessage(result.payload, "Unable to add team member."),
      null,
    );
  }

  revalidateTeamPaths();

  return success(unwrapPayload<TeamMember>(result.payload), "Member added.");
}

// Remove team member
export async function removeTeamMember(teamId: string, userId: string) {
  const result = await backendRequest<null>(
    `/teams/${teamId}/members/${userId}`,
    {
      method: "DELETE",
    },
  );

  if (!result.ok) {
    return failure(
      backendMessage(result.payload, "Unable to remove team member."),
      null,
    );
  }

  revalidateTeamPaths();

  return success(null, "Member removed.");
}
