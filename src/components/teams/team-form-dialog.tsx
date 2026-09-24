"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createTeam,
  type Team,
  updateTeam,
} from "@/actions/team.action";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";

type TeamFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & ({ mode: "create" } | { mode: "edit"; team: Team });

const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Team name is required.")
    .max(100, "Team name must be less than 100 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description must be less than 500 characters."),
});

type TeamFormValues = z.infer<typeof teamSchema>;

export function TeamFormDialog(props: TeamFormDialogProps) {
  const { open, onOpenChange, mode } = props;

  const team = mode === "edit" ? props.team : null;

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      name: team?.name ?? "",
      description: team?.description ?? "",
    });
  }, [open, team, reset]);

  async function onSubmit(values: TeamFormValues) {
    try {
      const name = values.name.trim();
      const description = values.description.trim();

      const result =
        mode === "create"
          ? await createTeam({
              name,
              description: description || undefined,
            })
          : await updateTeam(team?.id as string, {
              name,
              description,
            });

      if (!result.ok) {
        toast.error(result.message ?? "Unable to save team.");
        return;
      }

      toast.success(result.message ?? "Team saved.");

      onOpenChange(false);
    } catch (error) {
      console.error("Team form error:", error);

      toast.error(
        mode === "create"
          ? "Unable to create team."
          : "Unable to update team.",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!isSubmitting) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create team" : "Edit team"}
          </DialogTitle>

          <DialogDescription>
            {mode === "create"
              ? "Create a team for your organization."
              : "Update the team details below."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="team-name">Name</Label>

            <Input
              id="team-name"
              {...register("name")}
              placeholder="Engineering"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.name)}
            />

            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-description">
              Description
            </Label>

            <Textarea
              id="team-description"
              {...register("description")}
              placeholder="Describe what this team is responsible for..."
              rows={4}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.description)}
            />

            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create team"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}