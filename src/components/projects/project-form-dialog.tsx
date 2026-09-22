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
  | { mode: "create" }
  | { mode: "edit"; project: Project }
  | { mode: "upload"; project: Project }
  | { mode: "update-document"; project: Project }
);

export function ProjectFormDialog(props: ProjectFormDialogProps) {
  const { open, onOpenChange, mode } = props;
  const project = mode === "create" ? null : props.project;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const isDocumentMode = mode === "upload" || mode === "update-document";

  useEffect(() => {
    if (!open) return;
    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setStatus(project?.status ?? "ACTIVE");
    setFile(null);
  }, [open, project]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    let result;

    if (mode === "create") {
      if (!file) {
        setSaving(false);
        toast.error("A PDF document is required.");
        return;
      }
      if (file.type !== "application/pdf") {
        setSaving(false);
        toast.error("The project document must be a PDF.");
        return;
      }
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("status", status);
      formData.append("document", file);
      result = await createProject(formData);
    } else if (isDocumentMode && project) {
      if (!file) {
        setSaving(false);
        toast.error("Choose a PDF document first.");
        return;
      }
      result = await uploadProjectDocument(project.id, file);
    } else if (project) {
      result = await updateProject({
        id: project.id,
        name,
        description,
        status,
      });
    }

    setSaving(false);
    if (!result?.ok) {
      toast.error(result?.message ?? "Unable to save project.");
      return;
    }
    toast.success(result.message ?? "Project saved.");
    onOpenChange(false);
  }

  const title =
    mode === "create"
      ? "Create project"
      : mode === "edit"
        ? "Edit project"
        : project?.documentUrl
          ? "Update document"
          : "Upload document";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "A PDF document is required."
              : "Update the project information below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isDocumentMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="project-name">Name</Label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => value && setStatus(value)}
                >
                  <SelectTrigger id="project-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {isDocumentMode || mode === "create" ? (
            <div className="space-y-2">
              <Label htmlFor="project-document">PDF document</Label>
              <Input
                id="project-document"
                type="file"
                accept="application/pdf"
                required={mode === "create"}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Create project"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
