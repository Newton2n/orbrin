"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  flexRender,
  stockFeatures,
  useTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { LayoutGrid, List, Search } from "lucide-react";
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
import { SprintOverview } from "@/components/sprints/sprint-overview";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import {
  useTasks,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/hooks/use-tasks";

const columns: ColumnDef<any, any, any>[] = [
  {
    accessorKey: "title",
    header: "Task",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.title}</p>
        <p className="max-w-sm truncate text-xs text-muted-foreground">
          {row.original.description || "No description"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.status.replace("_", " ")}</Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <span className="text-xs font-medium">{row.original.priority}</span>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Due",
    cell: ({ row }) =>
      row.original.dueDate
        ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
            new Date(row.original.dueDate),
          )
        : "-",
  },
];
const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const priorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const priorityStyles: Record<TaskPriority, string> = {
  LOW: "border-slate-200 bg-slate-50 text-slate-700",
  MEDIUM: "border-blue-200 bg-blue-50 text-blue-700",
  HIGH: "border-amber-200 bg-amber-50 text-amber-700",
  URGENT: "border-red-200 bg-red-50 text-red-700",
};

export default function TasksPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const tasks = useTasks(projectId, {
    page: 1,
    limit: 50,
    search: search || undefined,
    status: status === "all" ? undefined : (status as TaskStatus),
    priority: priority === "all" ? undefined : (priority as TaskPriority),
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const rows = tasks.data?.items ?? [];
  const table = useTable({
    features: stockFeatures,
    data: rows,
    columns,
  });
  const grouped = useMemo(
    () =>
      statuses.map((value) => ({
        status: value,
        tasks: rows.filter((task) => task.status === value),
      })),
    [rows],
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            Execution workspace
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            Tasks
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Turn plans into visible, accountable progress.
          </p>
        </div>
        <div
          className="flex items-center gap-1 rounded-md border border-border bg-card p-1"
          role="group"
          aria-label="Task view"
        >
          <Button
            size="sm"
            variant={view === "board" ? "secondary" : "ghost"}
            onClick={() => setView("board")}
            aria-pressed={view === "board"}
          >
            <LayoutGrid /> Board
          </Button>
          <Button
            size="sm"
            variant={view === "list" ? "secondary" : "ghost"}
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
          >
            <List /> List
          </Button>
        </div>
      </div>
      {!projectId && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="font-heading font-semibold">
              Choose a project to load tasks
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Open this view with a projectId query parameter, for example{" "}
              <span className="font-mono">/dashboard/tasks?projectId=...</span>.
            </p>
          </CardContent>
        </Card>
      )}
      {projectId && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tasks..."
                    aria-label="Search tasks"
                  />
                </div>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value ?? "all")}
                >
                  <SelectTrigger
                    className="w-full lg:w-40"
                    aria-label="Filter by task status"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {statuses.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value ?? "all")}
                >
                  <SelectTrigger
                    className="w-full lg:w-36"
                    aria-label="Filter by priority"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    {priorities.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          {view === "board" ? (
            <div className="grid gap-4 xl:grid-cols-3">
              {grouped.map((column) => (
                <Card key={column.status} className="min-h-64 bg-muted/30">
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm">
                      {column.status.replace("_", " ")}
                    </CardTitle>
                    <Badge variant="secondary">{column.tasks.length}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {column.tasks.length ? (
                      column.tasks.map((task) => (
                        <button
                          type="button"
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="w-full rounded-md border border-border bg-card p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <p className="text-sm font-medium">{task.title}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <Badge className={priorityStyles[task.priority]}>
                              {task.priority}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                {new Intl.DateTimeFormat("en", {
                                  month: "short",
                                  day: "numeric",
                                }).format(new Date(task.dueDate))}
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="py-8 text-center text-xs text-muted-foreground">
                        No tasks here
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {table
                      .getHeaderGroups()
                      .flatMap((group) => group.headers)
                      .map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <div className="h-40 animate-pulse bg-muted" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedTask(row)}
                      >
                        {(row.getAllCells as unknown as () => Array<any>)().map(
                          (cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ),
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
          <SprintOverview projectId={projectId} />
          <TaskDetailSheet
            task={selectedTask}
            projectId={projectId}
            open={Boolean(selectedTask)}
            onOpenChange={(open) => !open && setSelectedTask(null)}
          />
        </>
      )}
    </section>
  );
}
