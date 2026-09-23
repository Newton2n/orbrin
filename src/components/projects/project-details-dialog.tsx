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

  role: "ADMIN" | "MANAGER" | "MEMBER";

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

function formatStatus(status?: string | null) {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ProjectDetailsDialog({
  open,
  onOpenChange,
  project,
  role,
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
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {project.name}
            </DialogTitle>

            <DialogDescription>
              Project details and management options.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </p>

              <div className="mt-2">
                <Badge>
                  {formatStatus(project.status)}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Teams
              </p>

              <p className="mt-2 font-medium">
                {project.teams?.length ?? 0}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </p>

              <p className="mt-2 text-sm">
                {project.description ||
                  "No description provided."}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tasks
              </p>

              <p className="mt-2 font-medium">
                {project.tasks?.length ?? 0}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Created
              </p>

              <p className="mt-2 text-sm">
                {project.createdAt
                  ? new Date(
                      project.createdAt,
                    ).toLocaleString()
                  : "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Updated
              </p>

              <p className="mt-2 text-sm">
                {project.updatedAt
                  ? new Date(
                      project.updatedAt,
                    ).toLocaleString()
                  : "Unknown"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t pt-4">
            {project.documentUrl ? (
              <Button
                variant="outline"
                asChild
              >
                <a
                  href={project.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View document
                </a>
              </Button>
            ) : (
              <span className="flex items-center text-sm text-muted-foreground">
                No document
              </span>
            )}

            {canUploadDocument && (
              <Button
                variant="outline"
                onClick={onUploadDocument}
              >
                {project.documentUrl
                  ? "Replace document"
                  : "Upload document"}
              </Button>
            )}

            {canDeleteDocument &&
              project.documentUrl && (
                <Button
                  variant="destructive"
                  onClick={onDeleteDocument}
                >
                  Delete document
                </Button>
              )}

            {canManageTeams && (
              <Button
                variant="outline"
                onClick={() =>
                  setTeamsOpen(true)
                }
              >
                Manage teams
              </Button>
            )}
          </div>

          <DialogFooter>
            {canEdit && (
              <Button
                variant="outline"
                onClick={onEdit}
              >
                Edit
              </Button>
            )}

            {canDelete && (
              <Button
                variant="destructive"
                onClick={onDelete}
              >
                Delete project
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProjectTeamsDialog
        open={teamsOpen}
        onOpenChange={setTeamsOpen}
        project={project}
        role={role}
        canManageTeams={canManageTeams}
      />
    </>
  );
}