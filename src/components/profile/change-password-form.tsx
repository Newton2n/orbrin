"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { changePassword } from "@/actions/user.action";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required."),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(128, "New password must be less than 128 characters."),
  })
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message:
        "New password must be different from your current password.",
      path: ["newPassword"],
    },
  );

type ChangePasswordFormValues = z.infer<
  typeof changePasswordSchema
>;

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  async function submit(
    values: ChangePasswordFormValues,
  ) {
    try {
      const result = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (!result.success) {
        toast.error(
          result.message ??
            "Unable to change password.",
        );
        return;
      }

      toast.success(
        result.message ?? "Password changed.",
      );

      reset();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="current-password">
              Current password
            </Label>

            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
              aria-invalid={Boolean(
                errors.currentPassword,
              )}
              disabled={isSubmitting}
            />

            {errors.currentPassword && (
              <p className="text-sm text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">
              New password
            </Label>

            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
              aria-invalid={Boolean(
                errors.newPassword,
              )}
              disabled={isSubmitting}
            />

            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Updating..."
              : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}