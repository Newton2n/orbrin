"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getProjectById,
  type Project,
} from "@/actions/project.action";
import {
  getSprintsByProject,
  type SprintListParams,
  type SprintListResponse,
} from "@/actions/sprint.action";

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["project", projectId],
    enabled: Boolean(projectId),
    queryFn: async (): Promise<Project> => {
      const result = await getProjectById(projectId);

      if (!result.ok || !result.data) {
        throw new Error(result.message);
      }

      return result.data;
    },
  });
}

export function useProjectSprints(
  projectId: string,
  params: SprintListParams = {},
) {
  return useQuery({
    queryKey: ["project-sprints", projectId, params],
    enabled: Boolean(projectId),
    queryFn: async (): Promise<SprintListResponse> => {
      const result = await getSprintsByProject(projectId, params);

      if (!result.ok) {
        throw new Error(result.message);
      }

      return result.data;
    },
  });
}
