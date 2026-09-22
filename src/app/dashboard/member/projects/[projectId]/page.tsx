import { getProjectById } from "@/actions/project.action";
import { SprintList } from "@/components/sprints/sprint-list";
import { TaskList } from "@/components/tasks/task-list";

export default async function MemberProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const projectResult = await getProjectById(projectId);
  const project = projectResult.ok ? projectResult.data : null;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Member project
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          {project?.name ?? "Project tasks"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {project?.description || "Review project work and current ownership."}
        </p>
      </div>
      <SprintList projectId={projectId} canViewDetails />
      {/* biome-ignore lint/a11y/useValidAriaRole: role is an application permission prop, not a DOM role */}
      <TaskList role="MEMBER" projectId={projectId} canViewDetails />
    </div>
  );
}
