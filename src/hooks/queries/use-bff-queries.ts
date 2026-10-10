"use client";

import { useQuery } from "@tanstack/react-query";

import type {
  OrganizationMember,
  OrganizationMemberListParams,
  PaginatedResponse as OrganizationPagination,
} from "@/actions/organization.action";
import type {
  Project,
  ProjectListParams,
  ProjectListResponse,
} from "@/actions/project.action";
import type { Team, TeamListParams, TeamMember } from "@/actions/team.action";
import type {
  Comment,
  CommentListResponse,
  CommentQueryParams,
} from "@/actions/comment.action";
import type {
  Task,
  TaskListResponse,
  TaskQueryParams,
} from "@/actions/task.action";
import type {
  Sprint,
  SprintListResponse,
  SprintListParams,
} from "@/actions/sprint.action";
import { bffGet } from "@/lib/client/bff";
import type { UserProfile } from "@/actions/user.action";

export const queryKeys = {
  teams: (params: TeamListParams = {}) => ["teams", params] as const,
  teamMembers: (teamId: string) => ["team-members", teamId] as const,

  projects: (params: ProjectListParams = {}) => ["projects", params] as const,
  project: (projectId: string) => ["projects", "detail", projectId] as const,
  sprint: (sprintId: string) => ["sprints", "detail", sprintId] as const,
  myTasks: (params: TaskQueryParams = {}) => ["tasks", "mine", params] as const,
  myCreatedTasks: (params: TaskQueryParams = {}) =>
    ["tasks", "created", params] as const,

  projectTasks: (projectId: string, params: TaskQueryParams = {}) =>
    ["tasks", "project", projectId, params] as const,

  sprints: (projectId: string, params: SprintListParams = {}) =>
    ["sprints", "project", projectId, params] as const,

  organizationMembers: (params: OrganizationMemberListParams = {}) =>
    ["organization-members", params] as const,

  organizationMember: (memberId: string) =>
    ["organization-members", "detail", memberId] as const,

  comments: (taskId: string, params: CommentQueryParams = {}) =>
    ["comments", taskId, params] as const,
};

function queryString(params: Record<string, unknown>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object") {
    const source = payload as Record<string, unknown>;

    if ("data" in source) {
      return source.data as T;
    }

    if ("result" in source) {
      return source.result as T;
    }
  }

  return payload as T;
}

export function useTeams(params: TeamListParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.teams(params),
    enabled,
    queryFn: async () => {
      const payload = await bffGet<unknown>(`/teams${queryString(params)}`);

      const value = unwrap<unknown>(payload);

      const source =
        value && typeof value === "object"
          ? (value as Record<string, unknown>)
          : {};

      const items = Array.isArray(source.items)
        ? source.items
        : Array.isArray(source.teams)
          ? source.teams
          : Array.isArray(value)
            ? value
            : [];

      return {
        items: items as Team[],
        total: Number(source.total ?? items.length),
        page: Number(source.page ?? params.page ?? 1),
        limit: Number(source.limit ?? params.limit ?? 10),
        totalPages: Number(source.totalPages ?? 1),
      };
    },
  });
}

export function useProjects(params: ProjectListParams = {}) {
  return useQuery({
    queryKey: queryKeys.projects(params),
    queryFn: async () => {
      const payload = await bffGet<unknown>(`/projects${queryString(params)}`);

      const source =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : {};

      return {
        projects: Array.isArray(source.data)
          ? (source.data as Project[])
          : (unwrap<Project[]>(payload) ?? []),
        pagination: source.pagination as ProjectListResponse["pagination"],
      };
    },
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    enabled: Boolean(projectId),
    queryFn: async () =>
      unwrap<Project>(await bffGet<unknown>(`/projects/${projectId}`)),
  });
}

export function useOrganizationMembers(
  params: OrganizationMemberListParams,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.organizationMembers(params),
    enabled,

    queryFn: async () => {
      const payload = await bffGet<{
        data?: OrganizationMember[];
        pagination?: OrganizationPagination<OrganizationMember>;
      }>(`/organizations/members${queryString(params)}`);

      const members = Array.isArray(payload.data) ? payload.data : [];
      const pagination = payload.pagination;

      return {
        items: members,
        total: pagination?.total ?? members.length,
        page: pagination?.page ?? params.page ?? 1,
        limit: pagination?.limit ?? params.limit ?? 10,
        totalPages: pagination?.totalPages ?? 1,
      } satisfies OrganizationPagination<OrganizationMember>;
    },

    refetchOnWindowFocus: false,

    retry: 1,
  });
}

export function useComments(taskId: string, params: CommentQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.comments(taskId, params),
    enabled: Boolean(taskId),
    queryFn: async () => {
      const payload = await bffGet<{
        data?: unknown;
        pagination?: CommentListResponse["pagination"];
      }>(`/comments/tasks/${taskId}${queryString(params)}`);

      return {
        comments: Array.isArray(payload.data)
          ? (payload.data as Comment[])
          : [],
        pagination: payload.pagination,
      };
    },
  });
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: queryKeys.teamMembers(teamId),
    enabled: Boolean(teamId),
    queryFn: async () => {
      const payload = await bffGet<unknown>(`/teams/${teamId}/members`);

      const value = unwrap<unknown>(payload);

      if (Array.isArray(value)) {
        return value as TeamMember[];
      }

      if (value && typeof value === "object") {
        const source = value as Record<string, unknown>;

        return (source.members ??
          source.items ??
          source.data ??
          []) as TeamMember[];
      }

      return [];
    },
  });
}

export function useProjectTasks(
  projectId: string,
  params: TaskQueryParams = {},
) {
  return useQuery({
    queryKey: queryKeys.projectTasks(projectId, params),
    enabled: Boolean(projectId),
    queryFn: async () => {
      const payload = await bffGet<{
        data?: unknown;
        pagination?: TaskListResponse["pagination"];
      }>(`/tasks/projects/${projectId}${queryString(params)}`);

      const tasks = Array.isArray(payload.data) ? (payload.data as Task[]) : [];

      return {
        tasks,
        pagination: payload.pagination ?? {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          total: tasks.length,
          totalPages: tasks.length ? 1 : 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      } satisfies TaskListResponse;
    },
  });
}

export function useProjectSprints(
  projectId: string,
  params: SprintListParams = {},
) {
  return useQuery({
    queryKey: queryKeys.sprints(projectId, params),
    enabled: Boolean(projectId),
    queryFn: async () => {
      const payload = await bffGet<{
        data?: unknown;
        pagination?: SprintListResponse["pagination"];
      }>(`/sprints/projects/${projectId}${queryString(params)}`);

      const sprints = Array.isArray(payload.data)
        ? (payload.data as Sprint[])
        : [];

      return {
        sprints,
        pagination: payload.pagination ?? {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          total: sprints.length,
          totalPages: sprints.length ? 1 : 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      } satisfies SprintListResponse;
    },
  });
}

export function useSprint(sprintId: string) {
  return useQuery({
    queryKey: queryKeys.sprint(sprintId),
    enabled: Boolean(sprintId),
    queryFn: async () =>
      unwrap<Sprint>(await bffGet<unknown>(`/sprints/${sprintId}`)),
  });
}

function useTaskList(
  key: readonly unknown[],
  endpoint: string,
  params: TaskQueryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: key,
    enabled: Boolean(endpoint) && enabled,
    queryFn: async () => {
      const payload = await bffGet<{
        data?: unknown;
        pagination?: TaskListResponse["pagination"];
      }>(`${endpoint}${queryString(params)}`);
      const tasks = Array.isArray(payload.data) ? (payload.data as Task[]) : [];

      return {
        tasks,
        pagination: payload.pagination ?? {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          total: tasks.length,
          totalPages: tasks.length ? 1 : 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      } satisfies TaskListResponse;
    },
  });
}

export function useMyTasks(params: TaskQueryParams = {}, enabled = true) {
  return useTaskList(
    queryKeys.myTasks(params),
    "/tasks/my-tasks",
    params,
    enabled,
  );
}

export function useMyCreatedTasks(
  params: TaskQueryParams = {},
  enabled = true,
) {
  return useTaskList(
    queryKeys.myCreatedTasks(params),
    "/tasks/created-tasks",
    params,
    enabled,
  );
}

export function useOrganizationMember(memberId: string | null) {
  return useQuery({
    queryKey: queryKeys.organizationMember(memberId ?? ""),
    enabled: Boolean(memberId),
    queryFn: async () =>
      unwrap<OrganizationMember>(
        await bffGet<unknown>(`/organizations/members/${memberId}`),
      ),
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const payload = await bffGet<unknown>("/users/me");
      return unwrap<UserProfile>(payload);
    },
  });
}
