"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createProject,
  updateProject,
  uploadProjectDocument,
  type Project,
} from "@/actions/project.action";

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

type ProjectFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & (
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      project: Project;
    }
  | {
      mode: "upload";
      project: Project;
    }
);

const PROJECT_STATUSES = [
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "IN_PROGRESS",
    label: "In progress",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "ARCHIVED",
    label: "Archived",
  },
] as const;

const projectStatusSchema = z.enum([
  "ACTIVE",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
]);

const projectFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required.")
    .max(
      100,
      "Project name must be less than 100 characters.",
    ),

  description: z
    .string()
    .trim()
    .max(
      1000,
      "Description must be less than 1000 characters.",
    ),

  status: projectStatusSchema,
});

const pdfFileSchema = z
  .instanceof(File, {
    message: "Please choose a PDF document.",
  })
  .refine(
    (file) =>
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf"),
    {
      message: "Only PDF documents are supported.",
    },
  );

type ProjectFormValues = z.infer<
  typeof projectFieldsSchema
>;

export function ProjectFormDialog(
  props: ProjectFormDialogProps,
) {
  const {
    open,
    onOpenChange,
    mode,
  } = props;

  const project =
    mode === "create" ? null : props.project;

  const [file, setFile] =
    useState<File | null>(null);

  const {
    register,
    handleSubmit: submitForm,
    reset,
    setValue,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(
      projectFieldsSchema,
    ),
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE",
    },
  });

  const status = watch("status");

  useEffect(() => {
    if (!open) {
      return;
    }

    // Reset the form whenever the dialog opens
    // or a different project is selected.
    const currentStatus =
      project?.status;

    const validStatus: ProjectFormValues["status"] =
      PROJECT_STATUSES.some(
        (item) => item.value === currentStatus,
      )
        ? (currentStatus as ProjectFormValues["status"])
        : "ACTIVE";

    reset({
      name: project?.name ?? "",
      description:
        project?.description ?? "",
      status: validStatus,
    });

    setFile(null);
  }, [open, project, reset]);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile =
      event.target.files?.[0] ?? null;

    setFile(selectedFile);
  }

  async function handleSubmit(
    values: ProjectFormValues,
  ) {
    // Upload mode only needs the selected PDF.
    if (mode === "upload") {
      if (!project) {
        return;
      }

      if (!file) {
        toast.error(
          "Please choose a PDF document.",
        );
        return;
      }

      const validation =
        pdfFileSchema.safeParse(file);

      if (!validation.success) {
        toast.error(
          validation.error.issues[0]
            ?.message ??
            "Invalid PDF document.",
        );
        return;
      }

      try {
        const result =
          await uploadProjectDocument(
            project.id,
            file,
          );

        if (!result.ok) {
          toast.error(
            result.message ??
              "Unable to upload document.",
          );
          return;
        }

        toast.success(
          result.message ??
            "Project document uploaded successfully.",
        );

        onOpenChange(false);
      } catch (error) {
        console.error(
          "Upload project document error:",
          error,
        );

        toast.error(
          "Something went wrong.",
        );
      }

      return;
    }

    // Create a new project.
    if (mode === "create") {
      const formData = new FormData();

      formData.append(
        "name",
        values.name.trim(),
      );

      if (values.description.trim()) {
        formData.append(
          "description",
          values.description.trim(),
        );
      }

      if (file) {
        const validation =
          pdfFileSchema.safeParse(file);

        if (!validation.success) {
          toast.error(
            validation.error.issues[0]
              ?.message ??
              "Invalid PDF document.",
          );
          return;
        }

        formData.append(
          "document",
          file,
        );
      }

      try {
        const result =
          await createProject(formData);

        if (!result.ok) {
          toast.error(
            result.message ??
              "Unable to create project.",
          );
          return;
        }

        toast.success(
          result.message ??
            "Project created successfully.",
        );

        onOpenChange(false);
      } catch (error) {
        console.error(
          "Create project error:",
          error,
        );

        toast.error(
          "Something went wrong.",
        );
      }

      return;
    }

    // Update the existing project.
    if (mode === "edit") {
      if (!project) {
        return;
      }

      try {
        const result =
          await updateProject({
            projectId: project.id,
            name: values.name.trim(),
            description:
              values.description.trim(),
            status: values.status,
          });

        if (!result.ok) {
          toast.error(
            result.message ??
              "Unable to update project.",
          );
          return;
        }

        toast.success(
          result.message ??
            "Project updated successfully.",
        );

        onOpenChange(false);
      } catch (error) {
        console.error(
          "Update project error:",
          error,
        );

        toast.error(
          "Something went wrong.",
        );
      }
    }
  }

  const title =
    mode === "create"
      ? "Create project"
      : mode === "edit"
        ? "Edit project"
        : "Upload project document";

  const documentMode =
    mode === "upload";

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        // Don't allow the dialog to close while saving.
        if (!isSubmitting) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>

          <DialogDescription>
            {mode === "create"
              ? "Create a project for your organization."
              : mode === "edit"
                ? "Update the project information."
                : "Upload a PDF document for this project."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={submitForm(handleSubmit)}
          className="space-y-5"
        >
          {!documentMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="project-name">
                  Project name
                </Label>

                <Input
                  id="project-name"
                  {...register("name")}
                  placeholder="Website Revamp"
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
                <Label htmlFor="project-description">
                  Description
                </Label>

                <Textarea
                  id="project-description"
                  {...register(
                    "description",
                  )}
                  placeholder="Describe the project..."
                  rows={4}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    errors.description,
                  )}
                />

                {errors.description && (
                  <p className="text-sm text-destructive">
                    {
                      errors.description
                        .message
                    }
                  </p>
                )}
              </div>
            </>
          )}

          {mode === "edit" && (
            <div className="space-y-2">
              <Label htmlFor="project-status">
                Status
              </Label>

              <Select
                value={status}
                onValueChange={(value) => {
                  if (value !== null) {
                    setValue(
                      "status",
                      value as ProjectFormValues["status"],
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      },
                    );
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="project-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  {PROJECT_STATUSES.map(
                    (item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              {errors.status && (
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>
          )}

          {(mode === "create" ||
            documentMode) && (
            <div className="space-y-2">
              <Label htmlFor="project-document">
                PDF document

                {mode === "create" && (
                  <span className="ml-1 text-muted-foreground">
                    (optional)
                  </span>
                )}
              </Label>

              <Input
                id="project-document"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />

              {file && (
                <p className="text-xs text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}

              {mode === "upload" && (
                <p className="text-xs text-muted-foreground">
                  PDF documents only.
                </p>
              )}
            </div>
          )}

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
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create project"
                  : mode === "edit"
                    ? "Save changes"
                    : "Upload document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}