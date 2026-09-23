"use client";

import { useState } from "react";
import type { Organization } from "@/actions/organization.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteOrganizationDialog } from "./delete-organization-dialog";
import { LeaveOrganizationDialog } from "./leave-organization-dialog";

export function DeleteOrganizationSection({
  organization,
}: {
  organization: Organization | null;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  return (
    <Card className="border-destructive/30 shadow-none">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">Organization access</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Deleting permanently removes the organization. Leaving is available
            to administrators through the backend policy.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setLeaveOpen(true)}>
            Leave organization
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete organization
          </Button>
        </div>
      </CardContent>
      <DeleteOrganizationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        organization={organization}
      />
      <LeaveOrganizationDialog open={leaveOpen} onOpenChange={setLeaveOpen} />
    </Card>
  );
}
