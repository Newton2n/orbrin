"use client";

import { useCallback, useEffect, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

import {
  deleteTask,
  getMyCreatedTasks,
  getMyTasks,
  type Task,
  type TaskPagination,
} from "@/actions/task.action";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { TaskCard } from "./task-card";
import { TaskDetailSheet } from "./task-detail-sheet";

type TaskPageMode = "created" | "assigned";

type TaskPageProps = {
  mode: TaskPageMode;
  canUpdate?: boolean;
  canDelete?: boolean;
};

const initialPagination: TaskPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function TaskPage({
  mode,
  canUpdate = true,
  canDelete = false,
}: TaskPageProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [pagination, setPagination] =
    useState<TaskPagination>(initialPagination);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Delete confirmation modal
  const [deleteTaskItem, setDeleteTaskItem] = useState<Task | null>(null);

  const [deleting, setDeleting] = useState(false);

  // --------------------------------------------------
  // Load tasks
  // --------------------------------------------------

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result =
        mode === "created"
          ? await getMyCreatedTasks({
              page: 1,
              limit: 20,
              sortBy: "createdAt",
              sortOrder: "desc",
            })
          : await getMyTasks({
              page: 1,
              limit: 20,
              sortBy: "createdAt",
              sortOrder: "desc",
            });

      if (!result.success) {
        setTasks([]);
        setPagination(initialPagination);
        setError(result.message ?? "Unable to load tasks.");
        return;
      }

      setTasks(result.data.tasks);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error("Failed to load tasks:", error);

      setTasks([]);
      setPagination(initialPagination);
      setError("Something went wrong while loading tasks.");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  // --------------------------------------------------
  // Task updated
  // --------------------------------------------------

  const handleTaskUpdated = useCallback((updatedTask: Task) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === updatedTask.id
          ? {
              ...task,
              ...updatedTask,
            }
          : task,
      ),
    );

    setSelectedTask((current) =>
      current?.id === updatedTask.id
        ? {
            ...current,
            ...updatedTask,
          }
        : current,
    );
  }, []);

  // --------------------------------------------------
  // Open delete confirmation
  // --------------------------------------------------

  const handleTaskDeleted = useCallback(
    (taskId: string) => {
      const task = tasks.find((item) => item.id === taskId);

      if (!task) {
        return;
      }

      setDeleteTaskItem(task);
    },
    [tasks],
  );

  // --------------------------------------------------
  // Confirm delete
  // --------------------------------------------------

  const handleConfirmDelete = async () => {
    if (!deleteTaskItem) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const result = await deleteTask(deleteTaskItem.id);

      if (!result.ok) {
        setError(result.message ?? "Unable to delete task.");
        return;
      }

      // Remove task from current list
      setTasks((current) =>
        current.filter((task) => task.id !== deleteTaskItem.id),
      );

      // Update total
      setPagination((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
      }));

      // Close task detail
      setSelectedTask(null);

      // Close delete dialog
      setDeleteTaskItem(null);
    } catch (error) {
      console.error("Failed to delete task:", error);

      setError("Something went wrong while deleting the task.");
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------
  // Page content
  // --------------------------------------------------

  const pageTitle = mode === "created" ? "My Created Tasks" : "My Tasks";

  const pageDescription =
    mode === "created"
      ? "Tasks you have created across your projects."
      : "Tasks currently assigned to you.";

  return (
    <div className="space-y-6">
      {/* ==================================================
          Header
      ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="size-5 text-primary" />

            <h1 className="text-2xl font-semibold tracking-tight">
              {pageTitle}
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {pageDescription}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void loadTasks()}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* ==================================================
          Error
      ================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />

          <div className="flex-1">
            <p className="font-medium text-destructive">Task action failed</p>

            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setError("");
              void loadTasks();
            }}
            disabled={loading}
          >
            Try again
          </Button>
        </div>
      )}

      {/* ==================================================
          Loading
      ================================================== */}

      {loading && (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading tasks...
          </div>
        </div>
      )}

      {/* ==================================================
          Empty
      ================================================== */}

      {!loading && !error && tasks.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border bg-card px-6 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <CheckCircle2 className="size-6 text-muted-foreground" />
          </div>

          <h2 className="font-semibold">
            {mode === "created"
              ? "No tasks created yet"
              : "No tasks assigned to you"}
          </h2>

          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {mode === "created"
              ? "Tasks you create from a project will appear here."
              : "When a task is assigned to you, it will appear here."}
          </p>
        </div>
      )}

      {/* ==================================================
          Tasks
      ================================================== */}

      {!loading && !error && tasks.length > 0 && (
        <>
          <div className="grid gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                canDelete={canDelete}
                onClick={() => setSelectedTask(task)}
                onDeleted={handleTaskDeleted}
              />
            ))}
          </div>

          {/* Pagination information */}
          <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
            <span>
              {pagination.total} {pagination.total === 1 ? "task" : "tasks"}
            </span>

            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </div>
        </>
      )}

      {/* ==================================================
          Task Details
      ================================================== */}

      <TaskDetailSheet
        task={selectedTask}
        open={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTask(null);
          }
        }}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onUpdated={handleTaskUpdated}
        onDeleted={handleTaskDeleted}
      />

      {/* ==================================================
          Delete Confirmation
      ================================================== */}

      <Dialog
        open={Boolean(deleteTaskItem)}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteTaskItem(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                &quot;
                {deleteTaskItem?.title}
                &quot;
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
              onClick={() => setDeleteTaskItem(null)}
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
    </div>
  );
}
