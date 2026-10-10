"use client";

import type { Organization } from "@/actions/organization.action";
import { useUrlQueryState } from "@/hooks/use-url-query-state";
import { DeleteOrganizationSection } from "@/components/organization/delete-organization-section";
import { OrganizationLogoUploader } from "@/components/organization/organization-logo-uploader";
import { OrganizationMembersTable } from "@/components/organization/organization-members-table";
import { OrganizationSettingsCard } from "@/components/organization/organization-settings-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = ["general", "members", "danger"] as const;
type OrganizationTab = (typeof tabs)[number];

function parseTab(value: string | null): OrganizationTab {
  return tabs.includes(value as OrganizationTab)
    ? (value as OrganizationTab)
    : "general";
}

export function OrganizationSettingsTabs({
  organization,
}: {
  organization: Organization;
}) {
  const { searchParams, updateQuery } = useUrlQueryState();
  const tab = parseTab(searchParams.get("tab"));

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        updateQuery({ tab: value === "general" ? null : value }, "push");
      }}
      className="space-y-5"
    >
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
            Manage roles, access, and membership status across the organization.
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
  );
}
