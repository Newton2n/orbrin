"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteSprint,
  getSprintById,
  type Sprint,
} from "@/actions/sprint.action";
import { StatusBadge } from "@/components/badge-status";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SprintFormDialog } from "./sprint-form-dialog";

type DashboardRole = "ADMIN" | "MANAGER" | "MEMBER";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprintId: string | null;
  role: DashboardRole;
  canEdit?: boolean;
  canDelete?: boolean;
  onChanged?: () => void;
};

function dateLabel(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "Not scheduled";
}

export function SprintDetailsDialog({
  open,
  onOpenChange,
  sprintId,
  role,
  canEdit = false,
  canDelete = false,
  onChanged,
}: Props) {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const allowedToMutate = role !== "MEMBER";

  async function load() {
    if (!sprintId) return;
    setLoading(true);
    const result = await getSprintById(sprintId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.message);
      setSprint(null);
      return;
    }
    setSprint(result.data);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: reload when this dialog opens for a sprint
  useEffect(() => {
    if (open) void load();
    else setSprint(null);
  }, [open, sprintId]);

  async function remove() {
    if (!sprint) return;
    setDeleting(true);
    const result = await deleteSprint(sprint.id, sprint.projectId);
    setDeleting(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setDeleteOpen(false);
    onOpenChange(false);
    onChanged?.();
  }

  const taskCount = Array.isArray(sprint?.tasks) ? sprint.tasks.length : null;
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{sprint?.name ?? "Sprint details"}</DialogTitle>
            <DialogDescription>
              {sprint?.goal ||
                "Review sprint schedule, status, and delivery context."}
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <p className="py-8 text-center text-muted-foreground">
              Loading sprint...
            </p>
          ) : !sprint ? (
            <p className="py-8 text-center text-muted-foreground">
              Sprint not found.
            </p>
          ) : (
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1">
                  <StatusBadge value={sprint.status} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Timeline</p>
                <p className="mt-1">
                  {dateLabel(sprint.startDate)} - {dateLabel(sprint.endDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="mt-1">{dateLabel(sprint.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Updated</p>
                <p className="mt-1">{dateLabel(sprint.updatedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tasks</p>
                <p className="mt-1">{taskCount ?? "Not included"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Project</p>
                <p className="mt-1 truncate">
                  {typeof sprint.project === "object" &&
                  sprint.project &&
                  "name" in sprint.project
                    ? String(sprint.project.name)
                    : sprint.projectId}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            {sprint && allowedToMutate && canEdit && (
              <Button variant="outline" onClick={() => setFormOpen(true)}>
                Edit
              </Button>
            )}
            {sprint && allowedToMutate && canDelete && (
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                Delete sprint
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {sprint && (
        <SprintFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          projectId={sprint.projectId}
          mode="edit"
          sprint={sprint}
          onSuccess={() => {
            void load();
            onChanged?.();
          }}
        />
      )}
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void remove()}
        title="Delete sprint"
        description={`Delete ${sprint?.name ?? "this sprint"}? This cannot be undone.`}
      />
      {deleting && <span className="sr-only">Deleting sprint...</span>}
    </>
  );
}
