"use client";

import { useState } from "react";
import type { Project } from "@/actions/project.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectTeamsDialog } from "./project-teams-dialog";

type ProjectDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  canManageTeams?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canUploadDocument?: boolean;
  canDeleteDocument?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onUploadDocument?: () => void;
  onDeleteDocument?: () => void;
};

export function ProjectDetailsDialog({
  open,
  onOpenChange,
  project,
  canManageTeams = false,
  canEdit = false,
  canDelete = false,
  canUploadDocument = false,
  canDeleteDocument = false,
  onEdit,
  onDelete,
  onUploadDocument,
  onDeleteDocument,
}: ProjectDetailsDialogProps) {
  const [teamsOpen, setTeamsOpen] = useState(false);
  if (!project) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{project.name}</DialogTitle>
            <DialogDescription>
              Project details and assigned teams.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge>{project.status ?? "Unknown"}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Description</p>
              <p>{project.description || "No description"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p>
                {project.createdAt
                  ? new Date(project.createdAt).toLocaleString()
                  : "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Updated</p>
              <p>
                {project.updatedAt
                  ? new Date(project.updatedAt).toLocaleString()
                  : "Unknown"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.documentUrl ? (
              <Button variant="outline" asChild>
                <a href={project.documentUrl} target="_blank" rel="noreferrer">
                  View document
                </a>
              </Button>
            ) : (
              <span className="text-muted-foreground">No document</span>
            )}
            {canUploadDocument && (
              <Button variant="outline" onClick={onUploadDocument}>
                Upload document
              </Button>
            )}
            {canDeleteDocument && project.documentUrl && (
              <Button variant="destructive" onClick={onDeleteDocument}>
                Delete document
              </Button>
            )}
            {canManageTeams && (
              <Button variant="outline" onClick={() => setTeamsOpen(true)}>
                Manage teams
              </Button>
            )}
          </div>
          <DialogFooter>
            {canEdit && (
              <Button variant="outline" onClick={onEdit}>
                Edit
              </Button>
            )}
            {canDelete && (
              <Button variant="destructive" onClick={onDelete}>
                Delete project
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ProjectTeamsDialog
        open={teamsOpen}
        onOpenChange={setTeamsOpen}
        projectId={project.id}
        canManageTeams={canManageTeams}
      />
    </>
  );
}
