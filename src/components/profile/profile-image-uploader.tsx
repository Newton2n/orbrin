"use client";

import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";

import {
  deleteProfileImage,
  type UserProfile,
  updateProfileImage,
} from "@/actions/user.action";

import { ImageUploadPreview } from "@/components/image-upload-preview";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const profileImageSchema = z.object({
  file: z
    .instanceof(File, {
      message: "Please select a valid image file.",
    })
    .refine(
      (file) =>
        ["image/png", "image/jpeg", "image/webp"].includes(
          file.type,
        ),
      {
        message: "Only PNG, JPG, or WEBP images are allowed.",
      },
    )
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      {
        message: "Image must be smaller than 5 MB.",
      },
    ),
});

export function ProfileImageUploader({
  profile,
}: {
  profile: UserProfile;
}) {
  const [saving, setSaving] = useState(false);

  async function select(file: File | null) {
    if (!file || saving) {
      return;
    }

    const validation = profileImageSchema.safeParse({
      file,
    });

    if (!validation.success) {
      toast.error(
        validation.error.issues[0]?.message ??
          "Invalid image.",
      );
      return;
    }

    setSaving(true);

    try {
      const result = await updateProfileImage(file);

      if (!result.success) {
        toast.error(
          result.message ?? "Unable to update picture.",
        );
        return;
      }

      toast.success(
        result.message ?? "Picture updated.",
      );
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const result = await deleteProfileImage();

      if (!result.success) {
        toast.error(
          result.message ?? "Unable to delete picture.",
        );
        return;
      }

      toast.success(
        result.message ?? "Picture deleted.",
      );
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile picture</CardTitle>
      </CardHeader>

      <CardContent>
        <ImageUploadPreview
          label="Profile picture"
          fallbackName={profile.fullName}
          currentImageUrl={profile.profileImageUrl}
          disabled={saving}
          onFileSelect={(file) => void select(file)}
          onDeleteCurrentImage={() => void remove()}
          isDeleting={saving}
          helperText="PNG, JPG, or WEBP up to 5 MB."
        />
      </CardContent>
    </Card>
  );
}