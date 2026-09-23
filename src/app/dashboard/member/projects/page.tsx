import { ProjectList } from "@/components/projects/project-list";

export default function MemberProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Member
        </p>

        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Projects
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          View projects and their current progress.
        </p>
      </div>

      <ProjectList
        role="MEMBER"
        canViewDetails
      />
    </div>
  );
}