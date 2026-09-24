import { notFound } from "next/navigation";

import { getProjectById } from "@/actions/project.action";
import { getSprintsByProject, type Sprint } from "@/actions/sprint.action";

import { ProjectDetailControls } from "@/components/projects/project-detail-controls";
import { SprintList } from "@/components/sprints/sprint-list";
import { TaskList } from "@/components/tasks/task-list";

export default async function ManagerProjectDetailsPage({
  params,
}: {
  params: Promise<{
    projectId: string;
  }>;
}) {
  const { projectId } = await params;

  const [projectResult, sprintResult] = await Promise.all([
    getProjectById(projectId),
    getSprintsByProject(projectId, {
      page: 1,
      limit: 100,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
  ]);

  if (!projectResult.ok || !projectResult.data) {
    notFound();
  }

  const project = projectResult.data;

  const sprints: Sprint[] = sprintResult.ok
    ? sprintResult.data.sprints.filter((sprint) => sprint.deletedAt === null)
    : [];

  return (
    <div className="space-y-8">
      {/* Project information */}
      <section className="space-y-4">
        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Manager project
            </p>

            <h1 className="mt-2 break-words font-heading text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              {project.name}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {project.description || "No project description provided."}
            </p>
          </div>

          <div className="shrink-0">
            <ProjectDetailControls
              project={project}
              role="MANAGER"
              canManageTeams
            />
          </div>
        </div>
      </section>

      {/* Sprints */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">Sprints</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Plan, track, and manage project iterations.
          </p>
        </div>

        <SprintList
          projectId={projectId}
          role="MANAGER"
          canCreate
          canEdit
          canDelete
          canViewDetails
        />
      </section>

      {/* Tasks */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">Tasks</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Create, assign, organize, and track tasks belonging to this project.
          </p>
        </div>

        <TaskList
          projectId={projectId}
          role="MANAGER"
          sprints={sprints}
          canCreate
          canEdit
          canDelete
          canViewDetails
        />
      </section>
    </div>
  );
}
