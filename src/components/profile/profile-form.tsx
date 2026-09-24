"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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

export function ProfileForm({
  profile,
}: {
  profile: UserProfile;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
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

  async function submit(values: ProfileFormValues) {
    try {
      const result = await updateUserProfile({
        fullName: values.fullName.trim(),
      });

      if (!result.success) {
        toast.error(
          result.message ?? "Unable to update profile.",
        );
        return;
      }

      toast.success(
        result.message ?? "Profile updated.",
      );
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile details</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="profile-name">
              Full name
            </Label>

            <Input
              id="profile-name"
              {...register("fullName")}
              aria-invalid={Boolean(errors.fullName)}
              disabled={isSubmitting}
            />

            {errors.fullName && (
              <p className="text-sm text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email">
              Email
            </Label>

            <Input
              id="profile-email"
              value={profile.email}
              readOnly
            />
          </div>

          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>Role</span>

            <span className="font-medium text-foreground">
              {profile.role ?? "Member"}
            </span>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}