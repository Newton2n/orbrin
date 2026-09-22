"use client";
import type { Sprint } from "@/actions/sprint.action";
import { StatusBadge } from "@/components/badge-status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
export function SprintDetailsDialog({
  open,
  onOpenChange,
  sprint,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint: Sprint | null;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  if (!sprint) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{sprint.name}</DialogTitle>
          <DialogDescription>
            {sprint.goal || "No sprint goal defined."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge value={sprint.status} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Schedule</p>
            <p className="mt-1 text-sm">
              {sprint.startDate
                ? new Date(sprint.startDate).toLocaleDateString()
                : "TBD"}{" "}
              -{" "}
              {sprint.endDate
                ? new Date(sprint.endDate).toLocaleDateString()
                : "TBD"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            {canEdit && (
              <Button variant="outline" onClick={onEdit}>
                Edit
              </Button>
            )}
            {canDelete && (
              <Button variant="destructive" onClick={onDelete}>
                Delete sprint
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
