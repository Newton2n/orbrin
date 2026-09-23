import { TeamList } from "@/components/teams/team-list";

export default function ManagerTeamsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Delivery
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Teams
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Balance capacity and keep membership aligned across delivery teams.
        </p>
      </div>
      {/* biome-ignore lint/a11y/useValidAriaRole: role is an application permission prop, not a DOM role */}
      <TeamList role="MANAGER" canManageMembers canViewDetails />
    </div>
  );
}
