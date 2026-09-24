"use client";

import {
  AlertTriangle,
  CalendarDays,
  CircleDot,
  Loader2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { Task } from "@/actions/task.action";
import { deleteTask } from "@/actions/task.action";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TaskCardProps = {
  task: Task;
  canDelete?: boolean;
  onClick: () => void;
  onDeleted: (taskId: string) => void;
};

const statusLabel: Record<Task["status"], string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  REVIEW: "Review",
  DONE: "Done",
};

const priorityLabel: Record<Task["priority"], string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export function TaskCard({
  task,
  canDelete = false,
  onClick,
  onDeleted,
}: TaskCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleCardClick() {
    if (deleting) return;
    onClick();
  }

  function handleDeleteClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!task.id || deleting) return;

    setDeleting(true);

    try {
      // This should be the exact database task ID.
      console.log("Deleting task with ID:", task.id);

      const result = await deleteTask(task.id);

      if (!result.success) {
        toast.error(result.message ?? "Unable to delete task.");
        return;
      }

      toast.success("Task deleted successfully.");

      setDeleteOpen(false);

      onDeleted(task.id);
    } catch (error) {
      console.error("Delete task error:", error);
      toast.error("Unable to delete task.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleCardClick();
          }
        }}
        className="group w-full cursor-pointer rounded-xl border bg-card p-5 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {statusLabel[task.status]}
              </span>

              <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                {priorityLabel[task.priority]}
              </span>
            </div>

            <h2 className="mt-3 truncate text-base font-semibold">
              {task.title}
            </h2>

            {task.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {task.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {task.project && (
                <span>
                  Project:{" "}
                  <span className="font-medium text-foreground">
                    {task.project.name}
                  </span>
                </span>
              )}

              {task.assignee && (
                <span>
                  Assigned to:{" "}
                  <span className="font-medium text-foreground">
                    {task.assignee.fullName}
                  </span>
                </span>
              )}

              {task.dueDate && (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CircleDot className="size-4 text-muted-foreground" />

            {canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleDeleteClick}
                aria-label="Delete task"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setDeleteOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>

            <DialogTitle>Delete task?</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                &quot;{task.title}&quot;
              </span>
              ?
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmDelete()}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 size-4" />
                  Delete task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
