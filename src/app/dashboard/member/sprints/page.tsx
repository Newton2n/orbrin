import { SprintProjectDirectory } from "@/components/sprints/sprint-project-directory";

export default function MemberSprintsPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Delivery
        </p>

        <h1 className="font-heading text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
          Sprints
        </h1>

        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          View project sprints, timelines, goals, and delivery progress.
        </p>
      </section>

      <SprintProjectDirectory role="MEMBER" />
    </div>
  );
}
