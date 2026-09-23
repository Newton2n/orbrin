import { getCurrentUser } from "@/actions/auth.action";
import { OrganizationMembersTable } from "@/components/organization/organization-members-table";

export default async function ManagerMembersPage() {
  const result = await getCurrentUser();
  if (!result.success || !result.data) return null;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          People
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          Organization members
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review members and manage roles or access where permitted.
        </p>
      </div>
      <OrganizationMembersTable
        currentUserRole="MANAGER"
        canManageMembers
        canRemoveMembers={false}
      />
    </div>
  );
}
