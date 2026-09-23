"use client";

import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteSprint,
  getSprintsByProject,
  type Sprint,
  type SprintListParams,
  type SprintStatus,
} from "@/actions/sprint.action";
import { StatusBadge } from "@/components/badge-status";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { ErrorState } from "@/components/shared/error-state";
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
import { SprintDetailsDialog } from "./sprint-details-dialog";
import { SprintFormDialog } from "./sprint-form-dialog";

export type DashboardRole = "ADMIN" | "MANAGER" | "MEMBER";
type SortValue =
  | "name-asc"
  | "name-desc"
  | "createdAt-desc"
  | "createdAt-asc"
  | "updatedAt-desc";

type Props = {
  projectId: string;
  role: DashboardRole;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canViewDetails?: boolean;
  title?: string;
  description?: string;
  compact?: boolean;
};

function dateLabel(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : null;
}

function timelineState(sprint: Sprint) {
  if (sprint.status === "COMPLETED") return "completed";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = sprint.startDate ? new Date(sprint.startDate) : null;
  const end = sprint.endDate ? new Date(sprint.endDate) : null;
  if (end && end < today) return "overdue";
  if (
    sprint.status === "ACTIVE" ||
    (start && start <= today && (!end || today <= end))
  )
    return "current";
  if (start && start > today) return "upcoming";
  return "unscheduled";
}

function timelineLabel(sprint: Sprint) {
  const start = dateLabel(sprint.startDate);
  const end = dateLabel(sprint.endDate);
  if (!start && !end) return "Not scheduled";
  if (!start) return `Ends ${end}`;
  if (!end) return `Starts ${start}`;
  return `${start} - ${end}`;
}

export function SprintList({
  projectId,
  role,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canViewDetails = false,
  title = "Sprints",
  description,
  compact = false,
}: Props) {
  const [items, setItems] = useState<Sprint[]>([]);
  const [params, setParams] = useState<SprintListParams>({
    page: 1,
    limit: compact ? 5 : 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState<SortValue>("createdAt-desc");
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<"create" | Sprint | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [target, setTarget] = useState<Sprint | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const result = await getSprintsByProject(projectId, params);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setError(null);
    setItems(result.data.items);
    setTotalPages(result.data.totalPages);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: reload when project or committed query changes
  useEffect(() => {
    void load();
  }, [projectId, params]);

  function applyFilters() {
    const [sortBy, sortOrder] = sort.split("-") as [
      "name" | "createdAt" | "updatedAt",
      "asc" | "desc",
    ];
    setParams({
      page: 1,
      limit: compact ? 5 : 10,
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : (status as SprintStatus),
      sortBy,
      sortOrder,
    });
  }

  async function remove() {
    if (!target) return;
    setSaving(true);
    const result = await deleteSprint(target.id, projectId);
    setSaving(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setTarget(null);
    void load();
  }

  const canMutate = role !== "MEMBER";
  return (
    <Card className={compact ? "border-border/70 shadow-none" : undefined}>
      <CardHeader className="gap-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {canCreate && canMutate && (
            <Button onClick={() => setForm("create")}>
              <Plus data-icon="inline-start" /> New sprint
            </Button>
          )}
        </div>
        {!compact && (
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search sprints"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyFilters();
                }}
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value ?? "ALL")}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="PLANNING">Planning</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(value) =>
                setSort((value ?? "createdAt-desc") as SortValue)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="createdAt-desc">Newest created</SelectItem>
                <SelectItem value="createdAt-asc">Oldest created</SelectItem>
                <SelectItem value="updatedAt-desc">Recently updated</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={applyFilters}>
              Apply
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Loading sprints...
          </p>
        ) : error ? (
          <ErrorState compact description={error} onRetry={() => void load()} />
        ) : items.length === 0 ? (
          <p className="m-4 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No sprints match this project and filter.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sprint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((sprint) => {
                const timeline = timelineState(sprint);
                const taskCount = Array.isArray(sprint.tasks)
                  ? sprint.tasks.length
                  : sprint.taskCount;
                return (
                  <TableRow key={sprint.id}>
                    <TableCell className="font-medium">{sprint.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <StatusBadge value={sprint.status} />
                        <p className="text-[10px] capitalize text-muted-foreground">
                          {timeline}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-56 truncate text-muted-foreground">
                      {sprint.goal || "No goal defined"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {timelineLabel(sprint)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {typeof taskCount === "number" ? taskCount : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dateLabel(sprint.createdAt) ?? "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {canViewDetails && (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="View sprint"
                            title="View sprint"
                            onClick={() => setDetailsId(sprint.id)}
                          >
                            <Eye />
                            <span className="sr-only">View sprint</span>
                          </Button>
                        )}
                        {canEdit && canMutate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit sprint"
                            title="Edit sprint"
                            onClick={() => setForm(sprint)}
                          >
                            <Pencil />
                            <span className="sr-only">Edit sprint</span>
                          </Button>
                        )}
                        {canDelete && canMutate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete sprint"
                            title="Delete sprint"
                            onClick={() => setTarget(sprint)}
                          >
                            <Trash2 />
                            <span className="sr-only">Delete sprint</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
          <span>
            Page {params.page ?? 1} of {Math.max(totalPages, 1)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || (params.page ?? 1) <= 1}
              onClick={() =>
                setParams((current) => ({
                  ...current,
                  page: (current.page ?? 1) - 1,
                }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || (params.page ?? 1) >= totalPages}
              onClick={() =>
                setParams((current) => ({
                  ...current,
                  page: (current.page ?? 1) + 1,
                }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
      {form && (
        <SprintFormDialog
          open
          onOpenChange={(open) => !open && setForm(null)}
          projectId={projectId}
          {...(form === "create"
            ? { mode: "create" }
            : { mode: "edit", sprint: form })}
          onSuccess={() => {
            setForm(null);
            void load();
          }}
        />
      )}
      <SprintDetailsDialog
        open={Boolean(detailsId)}
        onOpenChange={(open) => !open && setDetailsId(null)}
        sprintId={detailsId}
        role={role}
        canEdit={canEdit}
        canDelete={canDelete}
        onChanged={() => void load()}
      />
      <DeleteConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
        onCancel={() => setTarget(null)}
        onConfirm={() => void remove()}
        title="Delete sprint"
        description={`Delete ${target?.name ?? "this sprint"}? This cannot be undone.`}
      />
      {saving && <span className="sr-only">Deleting sprint...</span>}
    </Card>
  );
}
