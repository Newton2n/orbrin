
"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  type Organization,
  updateOrganization,
} from "@/actions/organization.action";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

    const trimmedName = name.trim();
    const normalizedSlug = slug.trim().toLowerCase();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      toast.error(
        "Organization name must be between 2 and 100 characters.",
      );
      return;
    }

    if (
      normalizedSlug.length < 2 ||
      normalizedSlug.length > 100 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)
    ) {
      toast.error(
        "Use 2-100 lowercase letters, numbers, or hyphens for the slug.",
      );
      return;
    }

    setSaving(true);

    try {
      const result = await updateOrganization({
        name: trimmedName,
        slug: normalizedSlug,
      });

      if (!result.success) {
        toast.error(
          result.message ?? "Unable to update organization.",
        );
        return;
      }

      toast.success(
        result.message ?? "Organization updated successfully.",
      );

      setOpen(false);
      onUpdated?.();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.", {
        description: "We couldn't update the organization.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Card className="h-fit border-border/70 shadow-none">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle>Organization profile</CardTitle>

            <CardDescription className="mt-1">
              Basic information about your workspace.
            </CardDescription>
          </div>

          {canManageOrganization && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={edit}
              className="shrink-0"
            >
              Edit organization
            </Button>
          )}
        </CardHeader>

        <CardContent>
          <div className="divide-y rounded-xl border">
            <InfoRow
              label="Name"
              value={organization?.name ?? "Unavailable"}
            />

            <InfoRow
              label="Slug"
              value={organization?.slug ?? "Unavailable"}
              mono
            />

            {organization?.createdAt && (
              <InfoRow
                label="Created"
                value={formatDate(organization.createdAt)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit organization</DialogTitle>

            <DialogDescription>
              Update your organization's name and URL slug.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(event) => void submit(event)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="organization-name">
                Organization name
              </Label>

              <Input
                id="organization-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Acme Inc."
                autoComplete="organization"
                disabled={saving}
                maxLength={100}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization-slug">
                Slug
              </Label>

              <Input
                id="organization-slug"
                value={slug}
                onChange={(event) =>
                  setSlug(event.target.value.toLowerCase())
                }
                placeholder="acme-inc"
                disabled={saving}
                maxLength={100}
                className="h-11"
              />

              <p className="text-xs leading-5 text-muted-foreground">
                Use lowercase letters, numbers, and hyphens.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
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

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-3.5">
      <span className="shrink-0 text-sm text-muted-foreground">
        {label}
      </span>

      <span
        className={`truncate text-right text-sm font-medium ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

