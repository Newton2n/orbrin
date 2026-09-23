"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  deleteOrganizationLogo,
  type Organization,
  updateOrganizationLogo,
} from "@/actions/organization.action";
import { AvatarWithFallback } from "@/components/avatar-with-fallback";
import { Button } from "@/components/ui/button";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }
    setSaving(true);
    const result = await updateOrganizationLogo(file);
    setSaving(false);
    if (!result.success) toast.error(result.message);
    else {
      toast.success(result.message);
      onUpdated?.();
    }
    event.target.value = "";
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
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <AvatarWithFallback
          name={organization?.name}
          imageUrl={organization?.logoUrl}
          size="lg"
        />
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={(event) => void upload(event)}
          />
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || saving}
          >
            {saving
              ? "Saving..."
              : organization?.logoUrl
                ? "Replace logo"
                : "Upload logo"}
          </Button>
          {organization?.logoUrl && (
            <Button
              variant="destructive"
              onClick={() => void remove()}
              disabled={disabled || saving}
            >
              Delete logo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
