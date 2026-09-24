"use client";

import { useCallback, useEffect, useState } from "react";

import {
  deleteSprint,
  getSprintById,
  getSprintsByProject,
  type Sprint,
  type SprintPagination,
  type SprintStatus,
} from "@/actions/sprint.action";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Target,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

import { SprintFormDialog } from "./sprint-form-dialog";
import { SprintDetailsDialog } from "./sprint-details-dialog";

type SprintListProps = {
  projectId: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canViewDetails?: boolean;
};

const PAGE_LIMIT = 10;

const taskStatusLabel: Record<string, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  REVIEW: "Review",
  DONE: "Done",
};

export function SprintList({
  projectId,
  role,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canViewDetails = true,
}: SprintListProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [pagination, setPagination] = useState<SprintPagination | null>(null);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [status, setStatus] = useState<"ALL" | SprintStatus>("ALL");

  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "updatedAt">(
    "createdAt",
  );

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingSprint, setDeletingSprint] = useState<Sprint | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadSprints = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getSprintsByProject(projectId, {
        page,
        limit: PAGE_LIMIT,
        search: search || undefined,
        sortBy,
        sortOrder,
        status: status === "ALL" ? undefined : status,
      });

      if (!result.ok) {
        toast.error(result.message ?? "Unable to load sprints.");

        setSprints([]);
        setPagination(null);
        return;
      }

      setSprints(result.data.sprints ?? []);
      setPagination(result.data.pagination ?? null);
    } catch (error) {
      console.error("Failed to load sprints:", error);

      toast.error("Unable to load sprints.");

      setSprints([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, page, search, sortBy, sortOrder, status]);

  useEffect(() => {
    void loadSprints();
  }, [loadSprints]);

  function handleSearchSubmit() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleStatusChange(
    value: "PLANNING" | "ACTIVE" | "COMPLETED" | "ALL" | null,
  ) {
    if (value === null) return;

    setPage(1);
    setStatus(value);
  }

  function handleSortChange(value: "createdAt" | "updatedAt" | "name" | null) {
    if (value === null) return;

    setPage(1);
    setSortBy(value);
  }

  function handleSortOrderChange(value: "asc" | "desc" | null) {
    if (value === null) return;

    setPage(1);
    setSortOrder(value);
  }

  function handleCreate() {
    setEditingSprint(null);
    setFormOpen(true);
  }

  function handleEdit(sprint: Sprint) {
    setEditingSprint(sprint);
    setFormOpen(true);
  }

  async function handleView(sprint: Sprint) {
    try {
      setSelectedSprint(sprint);
      setDetailsOpen(true);

      const result = await getSprintById(sprint.id);

      if (!result.ok) {
        toast.error(result.message ?? "Unable to load sprint details.");
        return;
      }

      if (result.data) {
        setSelectedSprint(result.data);
      }
    } catch (error) {
      console.error("Failed to load sprint details:", error);

      toast.error("Unable to load sprint details.");
    }
  }

  function handleDeleteClick(sprint: Sprint) {
    setDeletingSprint(sprint);
    setDeleteOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingSprint) return;

    try {
      setDeleteLoading(true);

      const result = await deleteSprint(deletingSprint.id);

      if (!result.ok) {
        toast.error(result.message ?? "Unable to delete sprint.");
        return;
      }

      toast.success(result.message ?? "Sprint deleted successfully.");

      setDeleteOpen(false);
      setDeletingSprint(null);

      await loadSprints();
    } catch (error) {
      console.error("Failed to delete sprint:", error);

      toast.error("Unable to delete sprint.");
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleFormSuccess() {
    setFormOpen(false);
    setEditingSprint(null);

    void loadSprints();
  }

  const totalPages = pagination?.totalPages ?? 1;

  const currentPage = pagination?.page ?? page;

  const hasPreviousPage = pagination?.hasPreviousPage ?? currentPage > 1;

  const hasNextPage = pagination?.hasNextPage ?? currentPage < totalPages;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Sprints</h2>

          <p className="text-sm text-muted-foreground">
            {pagination?.total ?? 0}{" "}
            {pagination?.total === 1 ? "sprint" : "sprints"} in this project
          </p>
        </div>

        {canCreate ? (
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 size-4" />
            Create sprint
          </Button>
        ) : null}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex min-w-0 flex-1 gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  placeholder="Search sprints..."
                  className="pl-9"
                />
              </div>

              <Button variant="secondary" onClick={handleSearchSubmit}>
                Search
              </Button>
            </div>

            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>

                <SelectItem value="PLANNING">Planning</SelectItem>

                <SelectItem value="ACTIVE">Active</SelectItem>

                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="createdAt">Created</SelectItem>

                <SelectItem value="updatedAt">Updated</SelectItem>

                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={handleSortOrderChange}>
              <SelectTrigger className="w-full lg:w-32">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="desc">Newest</SelectItem>

                <SelectItem value="asc">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading sprints...
          </div>
        </div>
      ) : null}

      {/* Empty */}
      {!loading && sprints.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <Target className="mx-auto size-8 text-muted-foreground" />

          <h3 className="mt-4 font-semibold">No sprints found</h3>

          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {search || status !== "ALL"
              ? "Try changing your search or filters."
              : "Create a sprint to start planning work for this project."}
          </p>

          {canCreate && !search && status === "ALL" ? (
            <Button className="mt-5" onClick={handleCreate}>
              <Plus className="mr-2 size-4" />
              Create sprint
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Desktop */}
      {!loading && sprints.length > 0 ? (
        <div className="hidden overflow-hidden rounded-xl border md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Sprint</th>

                  <th className="px-4 py-3 text-left font-medium">Status</th>

                  <th className="px-4 py-3 text-left font-medium">Timeline</th>

                  <th className="px-4 py-3 text-left font-medium">
                    Related tasks
                  </th>

                  <th className="px-4 py-3 text-left font-medium">Goal</th>

                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {sprints.map((sprint) => {
                  const tasks = sprint.tasks ?? [];

                  return (
                    <tr
                      key={sprint.id}
                      className="align-top transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium">{sprint.name}</p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <SprintStatusBadge status={sprint.status} />
                      </td>

                      <td className="px-4 py-4">
                        <SprintTimeline sprint={sprint} />
                      </td>

                      <td className="min-w-[260px] max-w-[360px] px-4 py-4">
                        {tasks.length > 0 ? (
                          <div className="space-y-2">
                            {tasks.slice(0, 4).map((task) => (
                              <div
                                key={task.id}
                                className="flex items-start justify-between gap-2 rounded-lg border bg-background px-3 py-2"
                              >
                                <p className="min-w-0 truncate text-xs font-medium">
                                  {task.title}
                                </p>

                                <Badge
                                  variant="outline"
                                  className="shrink-0 text-[10px]"
                                >
                                  {taskStatusLabel[task.status] ?? task.status}
                                </Badge>
                              </div>
                            ))}

                            {tasks.length > 4 ? (
                              <p className="text-xs text-muted-foreground">
                                +{tasks.length - 4} more tasks
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No tasks in this sprint.
                          </p>
                        )}
                      </td>

                      <td className="max-w-xs px-4 py-4">
                        <p className="truncate text-muted-foreground">
                          {sprint.goal || "No goal specified"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <SprintActions
                          sprint={sprint}
                          canEdit={canEdit}
                          canDelete={canDelete}
                          canViewDetails={canViewDetails}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDeleteClick}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Mobile */}
      {!loading && sprints.length > 0 ? (
        <div className="grid gap-3 md:hidden">
          {sprints.map((sprint) => {
            const tasks = sprint.tasks ?? [];

            return (
              <Card key={sprint.id}>
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">
                        {sprint.name}
                      </CardTitle>

                      <CardDescription className="mt-1">
                        {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                      </CardDescription>
                    </div>

                    <SprintStatusBadge status={sprint.status} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 p-4 pt-0">
                  <SprintTimeline sprint={sprint} />

                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Related tasks
                    </p>

                    {tasks.length > 0 ? (
                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            className="rounded-lg border bg-muted/20 p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="min-w-0 flex-1 text-sm font-medium">
                                {task.title}
                              </p>

                              <Badge
                                variant="outline"
                                className="shrink-0 text-[10px]"
                              >
                                {taskStatusLabel[task.status] ?? task.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No tasks in this sprint.
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Goal
                    </p>

                    <p className="text-sm">
                      {sprint.goal || "No goal specified"}
                    </p>
                  </div>

                  <SprintActions
                    sprint={sprint}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    canViewDetails={canViewDetails}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    mobile
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* Pagination */}
      {!loading && pagination && pagination.totalPages > 1 ? (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPreviousPage}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft className="mr-1 size-4" />
              Previous
            </Button>

            <Button
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

      <SprintFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setEditingSprint(null);
          }
        }}
        projectId={projectId}
        sprint={editingSprint}
        onSuccess={handleFormSuccess}
      />

      <SprintDetailsDialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);

          if (!open) {
            setSelectedSprint(null);
          }
        }}
        sprint={selectedSprint}
      />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deleteLoading) {
            setDeleteOpen(open);

            if (!open) {
              setDeletingSprint(null);
            }
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete sprint?</AlertDialogTitle>

            <AlertDialogDescription>
              This will delete <strong>{deletingSprint?.name}</strong>. This
              action cannot be undone from the sprint interface.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={deleteLoading}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteConfirm();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete sprint"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SprintStatusBadge({ status }: { status: SprintStatus }) {
  if (status === "ACTIVE") {
    return <Badge variant="default">Active</Badge>;
  }

  if (status === "COMPLETED") {
    return <Badge variant="secondary">Completed</Badge>;
  }

  return <Badge variant="outline">Planning</Badge>;
}

function SprintTimeline({ sprint }: { sprint: Sprint }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <CalendarDays className="size-3.5 shrink-0" />

      <span>{formatDate(sprint.startDate)}</span>

      <span>→</span>

      <span>{formatDate(sprint.endDate)}</span>
    </div>
  );
}

function SprintActions({
  sprint,
  canEdit,
  canDelete,
  canViewDetails,
  onView,
  onEdit,
  onDelete,
  mobile = false,
}: {
  sprint: Sprint;
  canEdit: boolean;
  canDelete: boolean;
  canViewDetails: boolean;
  onView: (sprint: Sprint) => void;
  onEdit: (sprint: Sprint) => void;
  onDelete: (sprint: Sprint) => void;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {canViewDetails ? (
          <Button variant="outline" size="sm" onClick={() => onView(sprint)}>
            <Eye className="mr-1.5 size-4" />
            View
          </Button>
        ) : null}

        {canEdit ? (
          <Button variant="outline" size="sm" onClick={() => onEdit(sprint)}>
            <Pencil className="mr-1.5 size-4" />
            Edit
          </Button>
        ) : null}

        {canDelete ? (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(sprint)}
          >
            <Trash2 className="mr-1.5 size-4" />
            Delete
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-1">
      {canViewDetails ? (
        <Button
          variant="ghost"
          size="icon"
          title="View sprint"
          onClick={() => onView(sprint)}
        >
          <Eye className="size-4" />
        </Button>
      ) : null}

      {canEdit ? (
        <Button
          variant="ghost"
          size="icon"
          title="Edit sprint"
          onClick={() => onEdit(sprint)}
        >
          <Pencil className="size-4" />
        </Button>
      ) : null}

      {canDelete ? (
        <Button
          variant="ghost"
          size="icon"
          title="Delete sprint"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(sprint)}
        >
          <Trash2 className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
