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

export type Team = {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  memberCount?: number;
  members?: TeamMember[];
  [key: string]: unknown;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role?: string;
  [key: string]: unknown;
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
  return { ...actionSuccess(data, message), ok: true };
}

function failure<T>(message: string, data: T): TeamActionResult<T> {
  return { ...actionFailure(message, data), ok: false };
}

function normalizeList<T>(
  payload: unknown,
  params: TeamListParams,
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
    : Array.isArray(nested.teams)
      ? nested.teams
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

const teamPaths = [
  "/dashboard/teams",
  "/dashboard/admin/teams",
  "/dashboard/manager/teams",
  "/dashboard/member/teams",
];

function revalidateTeamPaths() {
  for (const path of teamPaths) revalidatePath(path);
}

export async function getTeams(params: TeamListParams = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const result = await backendRequest<unknown>(
    `/teams${query.size ? `?${query}` : ""}`,
  );
  if (!result.ok)
    return failure(backendMessage(result.payload, "Unable to fetch teams."), {
      items: [],
      total: 0,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      totalPages: 0,
    });
  return success(normalizeList<Team>(unwrapPayload(result.payload), params));
}

export async function getTeamById(id: string) {
  const result = await backendRequest<Team>(`/teams/${id}`);
  if (!result.ok)
    return failure(
      backendMessage(result.payload, "Unable to fetch team."),
      null,
    );
  return success(unwrapPayload<Team>(result.payload));
}

export async function createTeam(input: {
  name: string;
  description?: string;
}) {
  const result = await backendRequest<Team>("/teams", {
    method: "POST",
    body: input,
  });
  if (!result.ok)
    return failure(
      backendMessage(result.payload, "Unable to create team."),
      null,
    );
  revalidateTeamPaths();
  return success(unwrapPayload<Team>(result.payload), "Team created.");
}

export async function updateTeam(
  id: string,
  input: { name?: string; description?: string },
) {
  const result = await backendRequest<Team>(`/teams/${id}`, {
    method: "PATCH",
    body: input,
  });
  if (!result.ok)
    return failure(
      backendMessage(result.payload, "Unable to update team."),
      null,
    );
  revalidateTeamPaths();
  return success(unwrapPayload<Team>(result.payload), "Team updated.");
}

export async function deleteTeam(id: string) {
  const result = await backendRequest<null>(`/teams/${id}`, {
    method: "DELETE",
  });
  if (!result.ok)
    return failure(
      backendMessage(result.payload, "Unable to delete team."),
      null,
    );
  revalidateTeamPaths();
  return success(null, "Team deleted.");
}

export async function getTeamMembers(teamId: string) {
  const result = await backendRequest<unknown>(`/teams/${teamId}/members`);
  if (!result.ok)
    return failure(
      backendMessage(result.payload, "Unable to fetch team members."),
      [],
    );
  const payload = unwrapPayload<unknown>(result.payload);
  const members = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === "object" &&
        Array.isArray((payload as Record<string, unknown>).members)
      ? (payload as Record<string, unknown>).members
      : [];
  return success(members as TeamMember[]);
}

export async function addTeamMember(teamId: string, userId: string) {
  const result = await backendRequest<TeamMember>(`/teams/${teamId}/members`, {
    method: "POST",
    body: { userId },
  });
  if (!result.ok)
    return failure(
      backendMessage(result.payload, "Unable to add team member."),
      null,
    );
  revalidateTeamPaths();
  return success(unwrapPayload<TeamMember>(result.payload), "Member added.");
}

export async function removeTeamMember(teamId: string, userId: string) {
  const result = await backendRequest<null>(
    `/teams/${teamId}/members/${userId}`,
    { method: "DELETE" },
  );
  if (!result.ok)
    return failure(
      backendMessage(result.payload, "Unable to remove team member."),
      null,
    );
  revalidateTeamPaths();
  return success(null, "Member removed.");
}
