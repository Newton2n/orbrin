"use client";

import type { Project } from "@/actions/project.action";
import type { Sprint } from "@/actions/sprint.action";

import { ProjectDetailControls } from "@/components/projects/project-detail-controls";
import { SprintList } from "@/components/sprints/sprint-list";
import { TaskList } from "@/components/tasks/task-list";
import {
  useProject,
  useProjectSprints,
} from "@/hooks/queries/use-queries";

type ProjectRole = "ADMIN" | "MANAGER" | "MEMBER";

type ProjectDetailsProps = {
  projectId: string;
  role: ProjectRole;
};

function ProjectDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
            <div className="h-9 w-64 animate-pulse rounded bg-muted" />
            <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-muted" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-80 animate-pulse rounded bg-muted" />
        </div>

        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded bg-muted" />
        </div>

        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </section>
    </div>
  );
}

function ProjectDetailsError() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Unable to load project</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The project could not be loaded. Please try again.
        </p>
      </div>
    </div>
  );
}

function getProjectLabel(role: ProjectRole) {
  switch (role) {
    case "ADMIN":
      return "Admin project";
    case "MANAGER":
      return "Manager project";
    default:
      return "Member project";
  }
}

function getTaskTitle(role: ProjectRole) {
  return role === "ADMIN" ? "All Tasks" : "Tasks";
}

function getTaskDescription(role: ProjectRole) {
  switch (role) {
    case "ADMIN":
      return "Manage all tasks in this project, assign team members, and organize work into sprints.";
    case "MANAGER":
      return "Create, assign, organize, and track tasks belonging to this project.";
    default:
      return "Tasks associated with this project.";
  }
}

function getSprints(sprints: Sprint[], role: ProjectRole) {
  return sprints.filter((sprint) => {
    if (sprint.deletedAt !== null) {
      return false;
    }

    if (role === "ADMIN") {
      return sprint.status !== "COMPLETED";
    }

    return true;
  });
}

export function ProjectDetails({
  projectId,
  role,
}: ProjectDetailsProps) {
  const projectQuery = useProject(projectId);

  const sprintQuery = useProjectSprints(projectId, {
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  if (projectQuery.isLoading || sprintQuery.isLoading) {
    return <ProjectDetailsSkeleton />;
  }

  if (projectQuery.isError || !projectQuery.data) {
    return <ProjectDetailsError />;
  }

  const project: Project = projectQuery.data;

  const allSprints = sprintQuery.data?.sprints ?? [];
  const sprints = getSprints(allSprints, role);

  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";
  const isMember = role === "MEMBER";

  return (
    <div className="space-y-8">
      {/* Project header */}
      <section className="space-y-4">
        <div
          className={
            isMember
              ? "flex min-w-0 flex-col"
              : "flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"
          }
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {getProjectLabel(role)}
            </p>

            <h1 className="mt-2 break-words font-heading text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              {project.name}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {project.description || "No project description provided."}
            </p>

            {isMember && project.documentUrl && (
              <div className="mt-4">
                <a
                  href={project.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View project document
                </a>
              </div>
            )}
          </div>

          {(isAdmin || isManager) && (
            <div className="shrink-0">
              <ProjectDetailControls
                project={project}
                role={role}
                canManageTeams
              />
            </div>
          )}
        </div>
      </section>

      {/* Sprints */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">
            Sprints
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {isMember
              ? "Sprints associated with this project."
              : "Plan, track, and manage project iterations."}
          </p>
        </div>

        <SprintList
          projectId={projectId}
          role={role}
          {...(!isMember && {
            canCreate: true,
            canEdit: true,
            canDelete: true,
          })}
          canViewDetails
        />
      </section>

      {/* Tasks */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">
            {getTaskTitle(role)}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {getTaskDescription(role)}
          </p>
        </div>

        <TaskList
          projectId={projectId}
          role={role}
          sprints={sprints}
          {...(!isMember && {
            canCreate: true,
            canEdit: true,
            canDelete: true,
          })}
          canViewDetails
        />
      </section>
    </div>
  );
}