import { notFound } from "next/navigation";

import { getProjectById } from "@/actions/project.action";

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

  const result =
    await getProjectById(projectId);

  if (!result.success || !result.data) {
    notFound();
  }

  const project = result.data;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Member project
        </p>

        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          {project.name}
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {project.description ||
            "No project description provided."}
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

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Sprints
          </h2>

          <p className="text-sm text-muted-foreground">
            Sprints associated with this
            project.
          </p>
        </div>

        <SprintList
          projectId={projectId}
          role="MEMBER"
          canViewDetails
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Tasks
          </h2>

          <p className="text-sm text-muted-foreground">
            Tasks associated with this
            project.
          </p>
        </div>

        <TaskList
          role="MEMBER"
          projectId={projectId}
          canViewDetails
        />
      </section>
    </div>
  );
}