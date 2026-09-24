"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";

import {
  deleteProfileImage,
  type UserProfile,
  updateProfileImage,
} from "@/actions/user.action";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const profileImageSchema = z.object({
  file: z
    .instanceof(File, {
      message: "Please select a valid image file.",
    })
    .refine(
      (file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type),
      {
        message: "Only PNG, JPG, or WEBP images are allowed.",
      },
    )
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Image must be smaller than 5 MB.",
    }),
});

export function ProfileImageUploader({ profile }: { profile: UserProfile }) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /*
   * Clean up the temporary browser URL when it changes
   * or when the component is removed.
   */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || saving) {
      return;
    }

    const validation = profileImageSchema.safeParse({
      file,
    });

    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message ?? "Invalid image.");

      event.target.value = "";
      return;
    }

    /*
     * Show the image immediately.
     * This does not upload anything yet.
     */
    const objectUrl = URL.createObjectURL(file);

    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }

      return objectUrl;
    });

    void upload(file, objectUrl, event.target);
  }

  async function upload(
    file: File,
    objectUrl: string,
    input: HTMLInputElement,
  ) {
    setSaving(true);

    try {
      const result = await updateProfileImage(file);

      if (!result.success) {
        toast.error(result.message ?? "Unable to update picture.");

        /*
         * Upload failed, so remove the temporary preview.
         */
        setPreviewUrl((current) => {
          if (current === objectUrl) {
            URL.revokeObjectURL(current);
            return null;
          }

          return current;
        });

        input.value = "";
        return;
      }

      toast.success(result.message ?? "Profile picture updated.");

      /*
       * Refresh the server component so profile.profileImageUrl
       * contains the newly uploaded image URL.
       */
      router.refresh();

      /*
       * Keep the local preview until the refreshed server image
       * is displayed.
       */
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");

      setPreviewUrl((current) => {
        if (current === objectUrl) {
          URL.revokeObjectURL(current);
          return null;
        }

        return current;
      });

      input.value = "";
    } finally {
      setSaving(false);
    }
  }

  async function removeImage() {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const result = await deleteProfileImage();

      if (!result.success) {
        toast.error(result.message ?? "Unable to delete picture.");
        return;
      }

      setPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }

        return null;
      });

      toast.success(result.message ?? "Profile picture deleted.");

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const imageSource = previewUrl ?? profile.profileImageUrl ?? null;

  const initials = getInitials(profile.fullName);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Profile picture</CardTitle>

        <CardDescription>
          Add a clear picture so your teammates can recognize you.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Preview */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative size-28 shrink-0 overflow-hidden rounded-full border bg-muted sm:size-32">
            {imageSource ? (
              <Image
                src={imageSource}
                alt={`${profile.fullName}'s profile picture`}
                fill
                sizes="128px"
                className="object-cover"
                unoptimized={Boolean(previewUrl)}
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-muted text-2xl font-semibold text-muted-foreground">
                {initials}
              </div>
            )}

            {saving && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <Loader2 className="size-5 animate-spin" />
              </div>
            )}
          </div>

          <div className="min-w-0 text-center sm:text-left">
            <p className="font-medium">{profile.fullName}</p>

            <p className="mt-1 truncate text-sm text-muted-foreground">
              {profile.email}
            </p>

            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground sm:justify-start">
              <span className="rounded-md bg-muted px-2 py-1">
                {profile.role ?? "Member"}
              </span>

              {profile.status && (
                <span className="rounded-md bg-muted px-2 py-1">
                  {profile.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Upload controls */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={saving} asChild>
              <label htmlFor="profile-image" className="cursor-pointer">
                {saving ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}

                {saving ? "Uploading..." : "Upload picture"}
              </label>
            </Button>

            {profile.profileImageUrl && (
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={() => void removeImage()}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Remove
              </Button>
            )}
          </div>

          <input
            id="profile-image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={saving}
            onChange={handleFileChange}
          />

          <div className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <ImageIcon className="mt-0.5 size-4 shrink-0" />

            <p>
              PNG, JPG, or WEBP. Maximum file size is 5 MB. Your new picture
              will appear immediately while it uploads.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
