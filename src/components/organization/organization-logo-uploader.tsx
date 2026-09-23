"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  deleteOrganizationLogo,
  type Organization,
  updateOrganizationLogo,
} from "@/actions/organization.action";
import { ImageUploadPreview } from "@/components/image-upload-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    const result = await updateOrganizationLogo(file);
    setSaving(false);
    if (!result.success) toast.error(result.message);
    else {
      toast.success(result.message);
      onUpdated?.();
    }
  }
  async function remove() {
    setSaving(true);
    const result = await deleteOrganizationLogo();
    setSaving(false);
    if (!result.success) toast.error(result.message);
    else {
      toast.success(result.message);
      onUpdated?.();
    }
  }
  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader>
        <CardTitle>Organization logo</CardTitle>
      </CardHeader>
      <CardContent>
        <ImageUploadPreview
          label="Organization logo"
          fallbackName={organization?.name}
          currentImageUrl={organization?.logoUrl}
          shape="square"
          disabled={disabled || saving}
          onFileSelect={(file) => void select(file)}
          onDeleteCurrentImage={() => remove()}
          isDeleting={saving}
          helperText="PNG, JPG, or WEBP up to 5 MB."
        />
      </CardContent>
    </Card>
  );
}
