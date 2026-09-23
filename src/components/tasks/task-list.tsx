"use client";

import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteTask,
  getProjectTasks,
  type Task,
  type TaskListParams,
  type TaskPriority,
  type TaskStatus,
} from "@/actions/task.action";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { TaskDetailsDialog } from "./task-details-dialog";
import { TaskFormDialog } from "./task-form-dialog";

export type Role = "ADMIN" | "MANAGER" | "MEMBER";
export type TaskListProps = {
  role: Role;
  projectId: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canViewDetails?: boolean;
};
const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
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

type FormState = { mode: "create" } | { mode: "edit"; task: Task } | null;

export function TaskList({
  role,
  projectId,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canViewDetails = false,
}: TaskListProps) {
  const [result, setResult] = useState<{
    items: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sortBy, setSortBy] = useState<TaskListParams["sortBy"]>("createdAt");
  const [form, setForm] = useState<FormState>(null);
  const [details, setDetails] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  async function loadTasks() {
    setLoading(true);
    const response = await getProjectTasks(projectId, {
      page,
      limit: 10,
      search: search || undefined,
      status: (status || undefined) as TaskStatus | undefined,
      priority: (priority || undefined) as TaskPriority | undefined,
      sortBy,
      sortOrder: "desc",
    });
    if (!response.ok) setError(response.message ?? "Unable to load tasks.");
    else {
      setError(undefined);
      setResult(response.data);
    }
    setLoading(false);
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies: reload when list query changes
  useEffect(() => {
    void loadTasks();
  }, [projectId, page, search, status, priority, sortBy]);

  async function handleDelete() {
    if (!deleteTarget) return;
    const response = await deleteTask(deleteTarget.id);
    if (!response.ok) toast.error(response.message ?? "Unable to delete task.");
    else {
      toast.success(response.message ?? "Task deleted.");
      setDeleteTarget(null);
      void loadTasks();
    }
  }

  const actionsVisible = canViewDetails || canEdit || canDelete;
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <Input
            className="lg:max-w-sm"
            placeholder="Search tasks"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <Select
            value={status || "ALL"}
            onValueChange={(value) => {
              setStatus(value === "ALL" ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger className="lg:w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {statuses.map((item) => (
                <SelectItem key={item} value={item}>
                  {item.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={priority || "ALL"}
            onValueChange={(value) => {
              setPriority(value === "ALL" ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger className="lg:w-40">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All priorities</SelectItem>
              {priorities.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy((value as TaskListParams["sortBy"]) || "createdAt")
            }
          >
            <SelectTrigger className="lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="updatedAt">Recently updated</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          {canCreate && (
            <Button
              className="lg:ml-auto"
              onClick={() => setForm({ mode: "create" })}
            >
              <Plus />
              New task
            </Button>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{role[0] + role.slice(1).toLowerCase()} tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="py-8 text-center text-muted-foreground">
              Loading tasks...
            </p>
          )}
          {error && (
            <ErrorState
              compact
              description={error}
              onRetry={() => void loadTasks()}
            />
          )}
          {!loading && !error && !result?.items.length && (
            <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No tasks found.
            </p>
          )}
          {!loading && !error && result?.items.length ? (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Due</TableHead>
                      {actionsVisible && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.items.map((task) => (
                      <TableRow key={task.id} className="h-14">
                        <TableCell>
                          <p className="font-medium">{task.title}</p>
                          <p className="max-w-xs truncate text-xs text-muted-foreground">
                            {task.description || "No description"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusStyle[task.status]}>
                            {task.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityStyle[task.priority]}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {task.assignee?.name ??
                            task.assignee?.email ??
                            "Unassigned"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "No date"}
                        </TableCell>
                        {actionsVisible && (
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              {canViewDetails && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="View task details"
                                  onClick={() => setDetails(task)}
                                >
                                  <Eye />
                                </Button>
                              )}
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Edit task"
                                  onClick={() =>
                                    setForm({ mode: "edit", task })
                                  }
                                >
                                  <Pencil />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Delete task"
                                  onClick={() => setDeleteTarget(task)}
                                >
                                  <Trash2 />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
                <span>
                  Page {result.page} of {result.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={result.page <= 1}
                    onClick={() => setPage(result.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={result.page >= result.totalPages}
                    onClick={() => setPage(result.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
      {form && (
        <TaskFormDialog
          open
          onOpenChange={(open) => !open && setForm(null)}
          projectId={projectId}
          {...form}
        />
      )}
      <TaskDetailsDialog
        open={Boolean(details)}
        onOpenChange={(open) => !open && setDetails(null)}
        task={details}
        canEdit={canEdit}
        canDelete={canDelete}
        canManageComments={canEdit}
        onEdit={() => details && setForm({ mode: "edit", task: details })}
        onDelete={() => details && setDeleteTarget(details)}
      />
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        title="Delete task"
        description={`Delete ${deleteTarget?.title ?? "this task"}? This cannot be undone.`}
      />
    </div>
  );
}
