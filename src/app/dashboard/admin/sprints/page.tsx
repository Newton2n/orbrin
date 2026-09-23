import { SprintProjectDirectory } from "@/components/sprints/sprint-project-directory";

export default function AdminSprintsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Delivery
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Sprints
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Plan, track, and complete project iterations.
        </p>
      </div>
      {/* biome-ignore lint/a11y/useValidAriaRole: role is an application permission prop, not a DOM role */}
      <SprintProjectDirectory role="ADMIN" />
    </div>
  );
}
