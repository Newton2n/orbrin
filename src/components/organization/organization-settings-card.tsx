"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  type Organization,
  updateOrganization,
} from "@/actions/organization.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type OrganizationSettingsCardProps = {
  organization: Organization | null;
  canManageOrganization: boolean;
  onUpdated?: () => void;
};

export function OrganizationSettingsCard({
  organization,
  canManageOrganization,
  onUpdated,
}: OrganizationSettingsCardProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(organization?.name ?? "");
  const [slug, setSlug] = useState(organization?.slug ?? "");
  const [saving, setSaving] = useState(false);

  function edit() {
    setName(organization?.name ?? "");
    setSlug(organization?.slug ?? "");
    setOpen(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2 || name.trim().length > 100) {
      toast.error("Organization name must be between 2 and 100 characters.");
      return;
    }
    if (
      slug.length < 2 ||
      slug.length > 100 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    ) {
      toast.error(
        "Use 2-100 lowercase letters, numbers, or hyphens for the slug.",
      );
      return;
    }
    setSaving(true);
    const result = await updateOrganization({ name: name.trim(), slug });
    setSaving(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setOpen(false);
    onUpdated?.();
  }

  return (
    <>
      <Card className="border-border/70 shadow-none">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Organization profile</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              The public identity used across your workspace.
            </p>
          </div>
          {canManageOrganization && (
            <Button variant="outline" onClick={edit}>
              Edit organization
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="mt-1 font-medium">
              {organization?.name ?? "Unavailable"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Slug</p>
            <p className="mt-1 font-medium">
              {organization?.slug ?? "Unavailable"}
            </p>
          </div>
          {organization?.createdAt && (
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="mt-1 font-medium">
                {new Date(organization.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
          {organization?.id && (
            <div>
              <p className="text-xs text-muted-foreground">Organization ID</p>
              <p className="mt-1 truncate font-mono text-xs">
                {organization.id}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit organization</DialogTitle>
            <DialogDescription>
              Update the name and URL-safe slug for your organization.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void submit(event)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization-name">Name</Label>
              <Input
                id="organization-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization-slug">Slug</Label>
              <Input
                id="organization-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value.toLowerCase())}
                disabled={saving}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
