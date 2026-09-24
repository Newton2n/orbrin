"use client";

import { toast } from "sonner";

import {
  deleteOrganizationLogo,
  type Organization,
  updateOrganizationLogo,
} from "@/actions/organization.action";

import { ImageUploadPreview } from "@/components/image-upload-preview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useState } from "react";

export function OrganizationLogoUploader({
  organization,
  disabled = false,
  onUpdated,
}: {
  organization: Organization | null;
  disabled?: boolean;
  onUpdated?: () => void;
}) {
  const [saving, setSaving] = useState(false);

  async function select(file: File | null) {
    if (!file) return;

    setSaving(true);

    try {
      const result = await updateOrganizationLogo(file);

      if (!result.success) {
        toast.error(
          result.message ?? "Unable to update organization logo.",
        );
        return;
      }

      toast.success(
        result.message ?? "Organization logo updated.",
      );

      onUpdated?.();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.", {
        description: "We couldn't update the organization logo.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);

    try {
      const result = await deleteOrganizationLogo();

      if (!result.success) {
        toast.error(
          result.message ?? "Unable to remove organization logo.",
        );
        return;
      }

      toast.success(
        result.message ?? "Organization logo removed.",
      );

      onUpdated?.();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.", {
        description: "We couldn't remove the organization logo.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="h-fit border-border/70 shadow-none">
      <CardHeader>
        <CardTitle>Organization logo</CardTitle>

        <CardDescription>
          Upload a logo that represents your organization.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ImageUploadPreview
          label="Organization logo"
          fallbackName={organization?.name}
          currentImageUrl={organization?.logoUrl}
          shape="square"
          disabled={disabled || saving}
          onFileSelect={(file) => void select(file)}
          onDeleteCurrentImage={() => void remove()}
          isDeleting={saving}
          helperText="PNG, JPG, or WEBP up to 5 MB."
        />
      </CardContent>
    </Card>
  );
}