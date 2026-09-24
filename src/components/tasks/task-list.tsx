"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createTask,
  getTasksByProject,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/actions/task.action";

import {
  getOrganizationMembers,
  type OrganizationMember,
} from "@/actions/organization.action";

import { type Sprint } from "@/actions/sprint.action";

import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { TaskCard } from "@/components/tasks/task-card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
  Target,
} from "lucide-react";

import { toast } from "sonner";

type TaskRole = "ADMIN" | "MANAGER" | "MEMBER";

type TaskListProps = {
  projectId: string;
  role: TaskRole;
  currentUserId?: string;
  sprints?: Sprint[];
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canViewDetails?: boolean;
};

type AssigneeOption = {
  id: string;
  fullName: string;
  email: string;
};

const PAGE_LIMIT = 20;

const createStatuses: Array<
  Extract<TaskStatus, "TODO" | "IN_PROGRESS" | "DONE">
> = ["TODO", "IN_PROGRESS", "DONE"];

const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const statusLabel: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  REVIEW: "Review",
  DONE: "Done",
};

const priorityLabel: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export function TaskList({
  projectId,
  role,
  currentUserId,
  sprints = [],
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canViewDetails = true,
}: TaskListProps) {
  const [view, setView] = useState<"board" | "list">("board");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [status, setStatus] = useState<"ALL" | TaskStatus>("ALL");
  const [priority, setPriority] = useState<"ALL" | TaskPriority>("ALL");

  const [sprintFilter, setSprintFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");

  const [tasks, setTasks] = useState<Task[]>([]);

  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null>(null);

  const [assignees, setAssignees] = useState<AssigneeOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [createSprintId, setCreateSprintId] = useState("");
  const [createAssigneeId, setCreateAssigneeId] = useState("");

  const [createStatus, setCreateStatus] =
    useState<Extract<TaskStatus, "TODO" | "IN_PROGRESS" | "DONE">>("TODO");

  const [createPriority, setCreatePriority] = useState<TaskPriority>("MEDIUM");

  const [createDueDate, setCreateDueDate] = useState("");

  const loadTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getTasksByProject(projectId, {
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
        status: status === "ALL" ? undefined : status,
        priority: priority === "ALL" ? undefined : priority,
        sprintId: sprintFilter === "ALL" ? undefined : sprintFilter,
        assigneeId: assigneeFilter === "ALL" ? undefined : assigneeFilter,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (!result.success) {
        setTasks([]);
        setPagination(null);
        setError(result.message ?? "Unable to load tasks.");
        return;
      }

      setTasks(result.data.tasks ?? []);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error("Failed to load project tasks:", error);
      setTasks([]);
      setPagination(null);
      setError("Unable to load project tasks.");
    } finally {
      setLoading(false);
    }
  }, [projectId, page, search, status, priority, sprintFilter, assigneeFilter]);

  const loadOptions = useCallback(async () => {
    setLoadingOptions(true);

    try {
      const memberResult = await getOrganizationMembers({
        page: 1,
        limit: 100,
        status: "ACTIVE",
      });

      if (memberResult.success) {
        const options = memberResult.data.items
          .filter(
            (member: OrganizationMember) =>
              member.status === "ACTIVE" && member.user?.status === "ACTIVE",
          )
          .map((member: OrganizationMember) => ({
            id: member.user!.id,
            fullName: member.user!.fullName,
            email: member.user!.email,
          }));

        setAssignees(options);
      } else {
        setAssignees([]);
      }
    } catch (error) {
      console.error("Failed to load task options:", error);
      setAssignees([]);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  function handleSearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetCreateForm() {
    setTitle("");
    setDescription("");
    setCreateSprintId("");
    setCreateAssigneeId("");
    setCreateStatus("TODO");
    setCreatePriority("MEDIUM");
    setCreateDueDate("");
  }

  function handleCreateOpen() {
    resetCreateForm();
    setCreateOpen(true);

    if (assignees.length === 0) {
      void loadOptions();
    }
  }

  async function handleCreateTask() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      toast.error("Task title is required.");
      return;
    }

    if (!projectId) {
      toast.error("Project ID is missing.");
      return;
    }

    setCreating(true);

    try {
      const result = await createTask(projectId, {
        title: trimmedTitle,
        description: description.trim() || undefined,
        status: createStatus,
        priority: createPriority,
        dueDate: createDueDate || undefined,
        sprintId: createSprintId || undefined,
        assigneeId: createAssigneeId || undefined,
      });

      if (!result.success) {
        toast.error(result.message ?? "Unable to create task.");
        return;
      }

      toast.success("Task created successfully.");

      setCreateOpen(false);
      resetCreateForm();

      await loadTasks();
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Unable to create task.");
    } finally {
      setCreating(false);
    }
  }

  const handleUpdated = useCallback((updatedTask: Task) => {
    setTasks((current) =>
      current.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    );

    setSelectedTask(updatedTask);
  }, []);

  const handleDeleted = useCallback((taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));

    setPagination((current) =>
      current
        ? {
            ...current,
            total: Math.max(0, current.total - 1),
          }
        : current,
    );

    setSelectedTask((current) => (current?.id === taskId ? null : current));
  }, []);

  const groupedTasks = useMemo(() => {
    return createStatuses.map((taskStatus) => ({
      status: taskStatus,
      tasks: tasks.filter((task) => task.status === taskStatus),
    }));
  }, [tasks]);

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? page;

  const hasPreviousPage = pagination?.hasPreviousPage ?? currentPage > 1;

  const hasNextPage = pagination?.hasNextPage ?? currentPage < totalPages;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">All Tasks</h2>

          <p className="text-sm text-muted-foreground">
            {pagination?.total ?? 0}{" "}
            {pagination?.total === 1 ? "task" : "tasks"} in this project
          </p>
        </div>

        {canCreate ? (
          <Button
            type="button"
            onClick={handleCreateOpen}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 size-4" />
            New task
          </Button>
        ) : null}
      </div>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Search tasks..."
                  className="pl-9"
                />
              </div>

              <Button type="button" variant="secondary" onClick={handleSearch}>
                Search
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Select
                value={status}
                onValueChange={(value) => {
                  setPage(1);
                  setStatus(value as "ALL" | TaskStatus);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>

                  <SelectItem value="TODO">To do</SelectItem>

                  <SelectItem value="IN_PROGRESS">In progress</SelectItem>

                  <SelectItem value="REVIEW">Review</SelectItem>

                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={priority}
                onValueChange={(value) => {
                  setPage(1);
                  setPriority(value as "ALL" | TaskPriority);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All priorities</SelectItem>

                  {priorities.map((item) => (
                    <SelectItem key={item} value={item}>
                      {priorityLabel[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sprintFilter}
                onValueChange={(value) => {
                  setPage(1);
                  setSprintFilter(value as string);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sprint" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All sprints</SelectItem>

                  {sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={assigneeFilter}
                onValueChange={(value) => {
                  setPage(1);
                  setAssigneeFilter(value as string);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All assignees</SelectItem>

                  {assignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!loading && tasks.length > 0 ? (
        <div className="flex items-center justify-between">
          <div className="flex rounded-lg border p-1">
            <Button
              type="button"
              size="sm"
              variant={view === "board" ? "secondary" : "ghost"}
              onClick={() => setView("board")}
            >
              <LayoutGrid className="mr-2 size-4" />
              Board
            </Button>

            <Button
              type="button"
              size="sm"
              variant={view === "list" ? "secondary" : "ghost"}
              onClick={() => setView("list")}
            >
              <List className="mr-2 size-4" />
              List
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading tasks...
          </div>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void loadTasks()}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {!loading && !error && tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <Target className="mx-auto size-8 text-muted-foreground" />

          <h3 className="mt-4 font-semibold">No tasks found</h3>

          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {search ||
            status !== "ALL" ||
            priority !== "ALL" ||
            sprintFilter !== "ALL" ||
            assigneeFilter !== "ALL"
              ? "Try changing your filters."
              : "Create a task to start tracking work for this project."}
          </p>

          {canCreate &&
          !search &&
          status === "ALL" &&
          priority === "ALL" &&
          sprintFilter === "ALL" &&
          assigneeFilter === "ALL" ? (
            <Button type="button" className="mt-5" onClick={handleCreateOpen}>
              <Plus className="mr-2 size-4" />
              Create task
            </Button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && tasks.length > 0 && view === "board" ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {groupedTasks.map((group) => (
            <Card key={group.status} className="min-w-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm">
                    {statusLabel[group.status]}
                  </CardTitle>

                  <Badge variant="secondary">{group.tasks.length}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {group.tasks.length > 0 ? (
                  group.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      canDelete={canDelete}
                      onClick={() => {
                        if (canViewDetails) {
                          setSelectedTask(task);
                        }
                      }}
                      onDeleted={handleDeleted}
                    />
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="text-xs text-muted-foreground">No tasks</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && !error && tasks.length > 0 && view === "list" ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              canDelete={canDelete}
              onClick={() => {
                if (canViewDetails) {
                  setSelectedTask(task);
                }
              }}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      ) : null}

      {!loading && !error && pagination && pagination.totalPages > 1 ? (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasPreviousPage}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft className="mr-1 size-4" />
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasNextPage}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!creating) {
            setCreateOpen(open);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create task</DialogTitle>

            <DialogDescription>
              Create a task for this project and optionally assign it to a
              sprint and team member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="create-task-title"
                className="text-sm font-medium"
              >
                Title
              </label>

              <Input
                id="create-task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter task title"
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="create-task-description"
                className="text-sm font-medium"
              >
                Description
              </label>

              <Textarea
                id="create-task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the task..."
                rows={5}
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sprint</label>

              <Select
                value={createSprintId || "NO_SPRINT"}
                onValueChange={(value) =>
                  setCreateSprintId(
                    value === "NO_SPRINT" ? "" : (value as string),
                  )
                }
                disabled={creating || loadingOptions}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingOptions ? "Loading sprints..." : "Select sprint"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="NO_SPRINT">No sprint</SelectItem>

                  {sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee</label>

              <Select
                value={createAssigneeId || "UNASSIGNED"}
                onValueChange={(value) =>
                  setCreateAssigneeId(
                    value === "UNASSIGNED" ? "" : (value as string),
                  )
                }
                disabled={creating || loadingOptions}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingOptions ? "Loading members..." : "Select assignee"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="UNASSIGNED">Unassigned</SelectItem>

                  {assignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>

              <Select
                value={createStatus}
                onValueChange={(value) =>
                  setCreateStatus(
                    value as Extract<
                      TaskStatus,
                      "TODO" | "IN_PROGRESS" | "DONE"
                    >,
                  )
                }
                disabled={creating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="TODO">To do</SelectItem>

                  <SelectItem value="IN_PROGRESS">In progress</SelectItem>

                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>

              <Select
                value={createPriority}
                onValueChange={(value) =>
                  setCreatePriority(value as TaskPriority)
                }
                disabled={creating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {priorities.map((item) => (
                    <SelectItem key={item} value={item}>
                      {priorityLabel[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="create-task-due-date"
                className="text-sm font-medium"
              >
                Due date
              </label>

              <Input
                id="create-task-due-date"
                type="date"
                value={createDueDate}
                onChange={(event) => setCreateDueDate(event.target.value)}
                disabled={creating}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={() => void handleCreateTask()}
              disabled={creating || !title.trim()}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 size-4" />
                  Create task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TaskDetailSheet
        task={selectedTask}
        open={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTask(null);
          }
        }}
        role={role}
        currentUserId={currentUserId}
        canUpdate={canEdit}
        canDelete={canDelete}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
