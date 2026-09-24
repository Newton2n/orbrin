"use client";

import { useEffect, useState } from "react";

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

import { toast } from "sonner";

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
];

export function ProjectFormDialog(props: ProjectFormDialogProps) {
  const { open, onOpenChange, mode } = props;

  const project = mode === "create" ? null : props.project;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const documentMode = mode === "upload";

  useEffect(() => {
    if (!open) return;

    setName(project?.name ?? "");
    setDescription(project?.description ?? "");

    const currentStatus = project?.status ?? "ACTIVE";

    setStatus(
      PROJECT_STATUSES.some((item) => item.value === currentStatus)
        ? currentStatus
        : "ACTIVE",
    );

    setFile(null);
  }, [open, project]);

  function validatePdf(selectedFile: File | null) {
    if (!selectedFile) {
      toast.error("Please choose a PDF document.");
      return false;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      toast.error("Only PDF documents are supported.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      if (mode === "create") {
        const formData = new FormData();

        formData.append("name", name.trim());

        if (description.trim()) {
          formData.append("description", description.trim());
        }

        if (file) {
          if (!validatePdf(file)) {
            return;
          }

          formData.append("document", file);
        }

        const result = await createProject(formData);

        if (!result.ok) {
          toast.error(result.message ?? "Unable to create project.");
          return;
        }

        toast.success(result.message ?? "Project created successfully.");

        onOpenChange(false);
        return;
      }

      if (mode === "edit") {
        if (!project) return;

        const result = await updateProject({
          projectId: project.id,
          name: name.trim(),
          description: description.trim(),
          status,
        });

        if (!result.ok) {
          toast.error(result.message ?? "Unable to update project.");
          return;
        }

        toast.success(result.message ?? "Project updated successfully.");

        onOpenChange(false);
        return;
      }

      if (mode === "upload") {
        if (!project) return;

        // Narrow File | null to File before calling the action.
        if (!file) {
          toast.error("Please choose a PDF document.");
          return;
        }

        if (!validatePdf(file)) {
          return;
        }

        const result = await uploadProjectDocument(project.id, file);

        if (!result.ok) {
          toast.error(result.message ?? "Unable to upload document.");
          return;
        }

        toast.success(
          result.message ?? "Project document uploaded successfully.",
        );

        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  }

  const title =
    mode === "create"
      ? "Create project"
      : mode === "edit"
        ? "Edit project"
        : "Upload project document";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          <DialogDescription>
            {mode === "create"
              ? "Create a project for your organization."
              : mode === "edit"
                ? "Update the project information."
                : "Upload a PDF document for this project."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!documentMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="project-name">Project name</Label>

                <Input
                  id="project-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Website Revamp"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description">Description</Label>

                <Textarea
                  id="project-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the project..."
                  rows={4}
                />
              </div>
            </>
          )}

          {mode === "edit" && (
            <div className="space-y-2">
              <Label htmlFor="project-status">Status</Label>

              <Select
                value={status}
                onValueChange={(value) => {
                  if (value !== null) {
                    setStatus(value);
                  }
                }}
              >
                <SelectTrigger id="project-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  {PROJECT_STATUSES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(mode === "create" || documentMode) && (
            <div className="space-y-2">
              <Label htmlFor="project-document">
                PDF document
                {mode === "create" && (
                  <span className="ml-1 text-muted-foreground">(optional)</span>
                )}
              </Label>

              <Input
                id="project-document"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />

              {file && (
                <p className="text-xs text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving}>
              {saving
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
