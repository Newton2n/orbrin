import { getMyOrganization } from "@/actions/organization.action";
import { OrganizationSettingsTabs } from "@/components/organization/organization-settings-tabs";
import { ErrorState } from "@/components/shared/error-state";

export default function AdminSettingsPage() {
  return <AdminOrganizationSettings />;
}

async function AdminOrganizationSettings() {
  const result = await getMyOrganization();

  if (!result.success || !result.data)
    return (
      <ErrorState
        title="Organization settings unavailable"
        description={result.message}
      />
    );
  const organization = result.data;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Organization settings
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em]">
          {organization?.name ?? "Organization"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your organization profile, logo, and members.
        </p>
      </div>
      <OrganizationSettingsTabs organization={organization} />
    </div>
  );
}
