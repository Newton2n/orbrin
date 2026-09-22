import { ProjectList } from "@/components/projects/project-list";

export default function AdminProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Admin
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">
          Projects (Admin)
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Full control: create, edit, delete, upload documents.
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
