import { SprintList } from "@/components/sprints/sprint-list";

export default async function MemberProjectSprintsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Member project
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Sprints
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View project iterations, timelines, and delivery progress.
        </p>
      </div>
      {/* biome-ignore lint/a11y/useValidAriaRole: role is an application permission prop, not a DOM role */}
      <SprintList projectId={projectId} role="MEMBER" canViewDetails />
    </div>
  );
}
