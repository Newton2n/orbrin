import { ProjectList } from "@/components/projects/project-list";

export default function AdminProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Admin
        </p>

        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Projects
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Create, manage, assign teams, and track organization projects.
        </p>
      </div>

      <ProjectList
        role="ADMIN"
        canCreate
        canEdit
        canDelete
        canUploadDocument
        canDeleteDocument
        canManageTeams
        canViewDetails
      />
    </div>
  );
}
