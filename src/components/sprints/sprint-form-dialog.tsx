"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createSprint,
  updateSprint,
  type Sprint,
  type SprintStatus,
} from "@/actions/sprint.action";

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

type SprintFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sprint?: Sprint | null;
  onSuccess?: (sprint: Sprint) => void;
};

const sprintStatusSchema = z.enum([
  "PLANNING",
  "ACTIVE",
  "COMPLETED",
]);

const sprintSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Sprint name is required.")
      .max(
        100,
        "Sprint name must be less than 100 characters.",
      ),

    goal: z
      .string()
      .trim()
      .max(
        1000,
        "Sprint goal must be less than 1000 characters.",
      ),

    status: sprintStatusSchema,

    startDate: z.string(),

    endDate: z.string(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }

      return data.startDate <= data.endDate;
    },
    {
      message: "End date cannot be before start date.",
      path: ["endDate"],
    },
  );

type SprintFormValues = z.infer<typeof sprintSchema>;

export function SprintFormDialog({
  open,
  onOpenChange,
  projectId,
  sprint,
  onSuccess,
}: SprintFormDialogProps) {
  const editing = Boolean(sprint);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<SprintFormValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: "",
      goal: "",
      status: "PLANNING",
      startDate: "",
      endDate: "",
    },
  });

  const status = watch("status");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (sprint) {
      reset({
        name: sprint.name,
        goal: sprint.goal ?? "",
        status: sprint.status as SprintFormValues["status"],
        startDate: toDateInputValue(
          sprint.startDate,
        ),
        endDate: toDateInputValue(
          sprint.endDate,
        ),
      });

      return;
    }

    reset({
      name: "",
      goal: "",
      status: "PLANNING",
      startDate: "",
      endDate: "",
    });
  }, [open, sprint, reset]);

  async function onSubmit(values: SprintFormValues) {
    try {
      if (sprint) {
        const result = await updateSprint({
          sprintId: sprint.id,
          name: values.name.trim(),
          goal: values.goal.trim(),
          status: values.status as SprintStatus,
          startDate: values.startDate
            ? new Date(
                `${values.startDate}T00:00:00`,
              ).toISOString()
            : undefined,
          endDate: values.endDate
            ? new Date(
                `${values.endDate}T23:59:59`,
              ).toISOString()
            : undefined,
        });

        if (!result.ok) {
          toast.error(
            result.message ??
              "Unable to update sprint.",
          );
          return;
        }

        toast.success(
          result.message ??
            "Sprint updated successfully.",
        );

        if (result.data) {
          onSuccess?.(result.data);
        }

        onOpenChange(false);
        return;
      }

      const result = await createSprint({
        projectId,
        name: values.name.trim(),
        goal: values.goal.trim(),
        status: values.status as SprintStatus,
        startDate: values.startDate
          ? new Date(
              `${values.startDate}T00:00:00`,
            ).toISOString()
          : undefined,
        endDate: values.endDate
          ? new Date(
              `${values.endDate}T23:59:59`,
            ).toISOString()
          : undefined,
      });

      if (!result.ok) {
        toast.error(
          result.message ??
            "Unable to create sprint.",
        );
        return;
      }

      toast.success(
        result.message ??
          "Sprint created successfully.",
      );

      if (result.data) {
        onSuccess?.(result.data);
      }

      onOpenChange(false);
    } catch (error) {
      console.error(
        "Sprint form error:",
        error,
      );

      toast.error(
        editing
          ? "Unable to update sprint."
          : "Unable to create sprint.",
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? "Edit sprint"
              : "Create sprint"}
          </DialogTitle>

          <DialogDescription>
            {editing
              ? "Update the sprint details and timeline."
              : "Create a new sprint for this project."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="sprint-name">
              Name
            </Label>

            <Input
              id="sprint-name"
              {...register("name")}
              placeholder="Sprint 1"
              disabled={isSubmitting}
              aria-invalid={Boolean(
                errors.name,
              )}
            />

            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprint-goal">
              Goal
            </Label>

            <Textarea
              id="sprint-goal"
              {...register("goal")}
              placeholder="What should this sprint accomplish?"
              rows={4}
              disabled={isSubmitting}
              aria-invalid={Boolean(
                errors.goal,
              )}
            />

            {errors.goal && (
              <p className="text-sm text-destructive">
                {errors.goal.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprint-status">
              Status
            </Label>

            <Select
              value={status}
              onValueChange={(value) => {
                if (value !== null) {
                  setValue(
                    "status",
                    value as SprintFormValues["status"],
                    {
                      shouldValidate: true,
                    },
                  );
                }
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="sprint-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="PLANNING">
                  Planning
                </SelectItem>

                <SelectItem value="ACTIVE">
                  Active
                </SelectItem>

                <SelectItem value="COMPLETED">
                  Completed
                </SelectItem>
              </SelectContent>
            </Select>

            {errors.status && (
              <p className="text-sm text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sprint-start">
                Start date
              </Label>

              <Input
                id="sprint-start"
                type="date"
                {...register("startDate")}
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  errors.startDate,
                )}
              />

              {errors.startDate && (
                <p className="text-sm text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sprint-end">
                End date
              </Label>

              <Input
                id="sprint-end"
                type="date"
                {...register("endDate")}
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  errors.endDate,
                )}
              />

              {errors.endDate && (
                <p className="text-sm text-destructive">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() =>
                onOpenChange(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {editing
                    ? "Updating..."
                    : "Creating..."}
                </>
              ) : editing ? (
                "Update sprint"
              ) : (
                "Create sprint"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function toDateInputValue(
  value: string | null,
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}