import { ProjectList } from "@/components/projects/project-list";

export default function MemberProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Member
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">
          Projects (Member)
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">View-only access.</p>
      </div>

      <ProjectList
        role="MEMBER"
        canCreate={false}
        canEdit={false}
        canDelete={false}
        canUploadDocument={false}
        canDeleteDocument={false}
        canManageTeams={false}
        canViewDetails
      />
    </div>
  );
}
