import { ProjectList } from "@/components/projects/project-list";

export default function ManagerProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Manager
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">
          Projects (Manager)
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Edit and upload documents. No delete.
        </p>
      </div>

      <ProjectList
        role="MANAGER"
        canCreate={true}
        canEdit
        canDelete={true}
        canUploadDocument
        canDeleteDocument
        canManageTeams
        canViewDetails
      />
    </div>
  );
}
