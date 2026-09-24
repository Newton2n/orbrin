import { notFound } from "next/navigation";

import { getProjectById } from "@/actions/project.action";
import { getSprintsByProject, type Sprint } from "@/actions/sprint.action";

import { SprintList } from "@/components/sprints/sprint-list";
import { TaskList } from "@/components/tasks/task-list";

export default async function MemberProjectDetailsPage({
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
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Member project
          </p>

          <h1 className="mt-2 break-words font-heading text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
            {project.name}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {project.description || "No project description provided."}
          </p>

          {project.documentUrl && (
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
      </section>

      {/* Sprints */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">Sprints</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Sprints associated with this project.
          </p>
        </div>

        <SprintList projectId={projectId} role="MEMBER" canViewDetails />
      </section>

      {/* Tasks */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">Tasks</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Tasks associated with this project.
          </p>
        </div>

        <TaskList
          projectId={projectId}
          role="MEMBER"
          sprints={sprints}
          canViewDetails
        />
      </section>
    </div>
  );
}
