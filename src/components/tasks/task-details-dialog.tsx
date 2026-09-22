"use client";

import type { Task } from "@/actions/task.action";
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
import { TaskCommentsSection } from "./task-comments-section";

export type TaskDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  canEdit?: boolean;
  canDelete?: boolean;
  canManageComments?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

const statusStyle: Record<string, string> = {
  TODO: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  IN_PROGRESS: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  REVIEW: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  DONE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};
const priorityStyle: Record<string, string> = {
  URGENT: "bg-red-500/10 text-red-700 dark:text-red-300",
  HIGH: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  MEDIUM: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  LOW: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export function TaskDetailsDialog({
  open,
  onOpenChange,
  task,
  canEdit = false,
  canDelete = false,
  canManageComments = canEdit,
  onEdit,
  onDelete,
}: TaskDetailsDialogProps) {
  if (!task) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>
            {task.description || "No description added yet."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            <Badge className={`mt-1 ${statusStyle[task.status] ?? ""}`}>
              {task.status.replace("_", " ")}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Priority
            </p>
            <Badge className={`mt-1 ${priorityStyle[task.priority] ?? ""}`}>
              {task.priority}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Assignee
            </p>
            <p className="mt-1 text-sm">
              {task.assignee?.name ??
                task.assignee?.email ??
                task.assigneeId ??
                "Unassigned"}
            </p>
            {task.assignee?.email && (
              <p className="text-xs text-muted-foreground">
                {task.assignee.email}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Due date
            </p>
            <p className="mt-1 text-sm">
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString()
                : "No due date"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Created
            </p>
            <p className="mt-1 text-sm">
              {task.createdAt
                ? new Date(task.createdAt).toLocaleString()
                : "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Updated
            </p>
            <p className="mt-1 text-sm">
              {task.updatedAt
                ? new Date(task.updatedAt).toLocaleString()
                : "Unknown"}
            </p>
          </div>
        </div>
        <TaskCommentsSection taskId={task.id} canManage={canManageComments} />
        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            {canEdit && (
              <Button variant="outline" onClick={onEdit}>
                Edit
              </Button>
            )}
            {canDelete && (
              <Button variant="destructive" onClick={onDelete}>
                Delete task
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
