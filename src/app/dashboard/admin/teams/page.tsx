import { TeamList } from "@/components/teams/team-list";

export default function AdminTeamsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Organization
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Teams
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create teams, assign members, and keep ownership clear.
        </p>
      </div>
      {/* biome-ignore lint/a11y/useValidAriaRole: role is an application permission prop, not a DOM role */}
      <TeamList
        role="ADMIN"
        canCreate
        canEdit
        canDelete
        canManageMembers
        canViewDetails
      />
    </div>
  );
}
