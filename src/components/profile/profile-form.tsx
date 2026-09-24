
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  type UserProfile,
  updateUserProfile,
} from "@/actions/user.action";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name must be less than 100 characters."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: UserProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
    },
  });

  useEffect(() => {
    reset({
      fullName: profile.fullName,
    });
  }, [profile.fullName, reset]);

  function handleEdit() {
    reset({
      fullName: profile.fullName,
    });

    setEditing(true);
  }

  function handleCancel() {
    reset({
      fullName: profile.fullName,
    });

    setEditing(false);
  }

  async function submit(values: ProfileFormValues) {
    try {
      const fullName = values.fullName.trim();

      const result = await updateUserProfile({
        fullName,
      });

      if (!result.success) {
        toast.error(result.message ?? "Unable to update profile.");
        return;
      }

      toast.success(
        result.message ?? "Profile updated successfully.",
      );

      reset({
        fullName,
      });

      setEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Personal information</CardTitle>

          <CardDescription className="mt-1">
            Your account information.
          </CardDescription>
        </div>

        {!editing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            <Pencil className="mr-2 size-4" />
            Edit
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          {/* Full name */}
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full name</Label>

            <Input
              id="profile-name"
              {...register("fullName")}
              disabled={!editing || isSubmitting}
              readOnly={!editing}
              aria-invalid={Boolean(errors.fullName)}
              placeholder="Your full name"
              autoComplete="name"
            />

            {errors.fullName && editing && (
              <p className="text-xs text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>

            <Input
              id="profile-email"
              value={profile.email}
              readOnly
              disabled
              className="bg-muted/50"
            />

            <p className="text-xs text-muted-foreground">
              Email cannot be changed here.
            </p>
          </div>

          {/* Account details */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-sm">
            <div>
              <span className="text-muted-foreground">Role</span>
              <p className="mt-0.5 font-medium">
                {profile.role ?? "Member"}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground">Status</span>
              <p className="mt-0.5 font-medium">
                {profile.status ?? "Active"}
              </p>
            </div>
          </div>

          {/* Actions */}
          {editing && (
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting}
                onClick={handleCancel}
              >
                <X className="mr-2 size-4" />
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

