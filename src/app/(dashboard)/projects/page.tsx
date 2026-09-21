"use client";

import { useMemo, useRef, useState } from "react";
import {
  flexRender,
  stockFeatures,
  useTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  Plus,
  Search,
  Upload,
  Users,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  useProjectMutations,
  useProjects,
  type Project,
} from "@/hooks/use-projects";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-slate-100 text-slate-700",
  ARCHIVED: "bg-red-100 text-red-700",
};
const readable = (value?: string) => (value ?? "ACTIVE").replaceAll("_", " ");

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const params = {
    page,
    limit: 10,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc" as const,
    status: status === "all" ? undefined : status,
  };
  const projects = useProjects(params);
  const { deleteProject, updateProject, uploadDocument } =
    useProjectMutations();
  const rows = projects.data?.items ?? [];

  const columns = useMemo<ColumnDef<any, any, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Project",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
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
          <Badge
            className={
              statusStyles[row.original.status ?? "ACTIVE"] ??
              "bg-muted text-muted-foreground"
            }
          >
            {readable(row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) =>
          row.original.createdAt
            ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                new Date(row.original.createdAt),
              )
            : "-",
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Actions for ${row.original.name}`}
                />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  const name = window.prompt("Project name", row.original.name);
                  if (name?.trim())
                    updateProject.mutate({
                      id: row.original.id,
                      name: name.trim(),
                    });
                }}
              >
                <Pencil /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  toast.info("Team assignment", {
                    description: "Team assignment controls are coming next.",
                  })
                }
              >
                <Users /> Assign team
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setUploadTarget(row.original.id);
                  fileInput.current?.click();
                }}
              >
                <Upload /> Upload document
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteTarget(row.original)}
              >
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [updateProject],
  );
  const table = useTable({
    features: stockFeatures,
    data: rows,
    columns,
  });

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProject.mutateAsync(deleteTarget.id);
      toast.success("Project deleted");
      setDeleteTarget(null);
    } catch (error) {
      toast.error("Could not delete project", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }
  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !uploadTarget) return;
    try {
      await uploadDocument.mutateAsync({ id: uploadTarget, document: file });
      toast.success("Document uploaded");
    } catch (error) {
      toast.error("Could not upload document", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      event.target.value = "";
      setUploadTarget(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Delivery workspace</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            Projects
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep every initiative visible, accountable, and moving.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus /> Create project
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search projects..."
                aria-label="Search projects"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value ?? "all");
                setPage(1);
              }}
            >
              <SelectTrigger
                className="w-full sm:w-44"
                aria-label="Filter projects by status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {table
                .getHeaderGroups()
                .map((group) =>
                  group.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  )),
                )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.isLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={4}>
                    <div className="h-10 animate-pulse rounded bg-muted" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="py-16 text-center">
                    <p className="font-heading font-semibold">
                      No projects found
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Adjust your search or create the first project.
                    </p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => setCreateOpen(true)}
                    >
                      Create project
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-border/70 px-4 py-3 text-xs text-muted-foreground">
          <span>{projects.data?.total ?? 0} projects</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!projects.data || page >= projects.data.totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
      <input
        ref={fileInput}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleUpload}
      />
      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the project and its workspace data. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteProject.isPending}
            >
              {deleteProject.isPending ? "Deleting..." : "Delete project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
