import { getMyOrganization } from "@/actions/organization.action";
import { DeleteOrganizationSection } from "@/components/organization/delete-organization-section";
import { OrganizationLogoUploader } from "@/components/organization/organization-logo-uploader";
import { OrganizationMembersTable } from "@/components/organization/organization-members-table";
import { OrganizationSettingsCard } from "@/components/organization/organization-settings-card";
import { ErrorState } from "@/components/shared/error-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSettingsPage() {
  return <AdminOrganizationSettings />;
}

async function AdminOrganizationSettings() {
  const result = await getMyOrganization();
  if (!result.success)
    return (
      <ErrorState
        title="Organization settings unavailable"
        description={result.message}
      />
    );
  const organization = result.success ? result.data : null;
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
      <Tabs defaultValue="general" className="space-y-5">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-5">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <OrganizationSettingsCard
              organization={organization}
              canManageOrganization
            />
            <OrganizationLogoUploader organization={organization} />
          </div>
        </TabsContent>
        <TabsContent value="members" className="space-y-5">
          <div>
            <h2 className="font-heading text-lg font-semibold">Members</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage roles, access, and membership status across the
              organization.
            </p>
          </div>
          <OrganizationMembersTable
            currentUserRole="ADMIN"
            canManageMembers
            canRemoveMembers
          />
        </TabsContent>
        <TabsContent value="danger">
          <DeleteOrganizationSection organization={organization} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
