"use client";

import {
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  deleteProject,
  getProjects,
  type PaginatedResponse,
  type Project,
  updateProject,
  uploadProjectDocument,
} from "../../../actions/project.action";
import { CreateProjectDialog } from "../../../components/projects/create-project-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

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
  const [projects, setProjects] = useState<PaginatedResponse<Project>>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    getProjects({
      page,
      limit: 10,
      search: search || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
      status: status === "all" ? undefined : status,
    }).then((result) => {
      if (active && result.success) setProjects(result.data);
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [page, search, status]);
  const rows = projects.items;

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      const result = await deleteProject(deleteTarget.id);
      if (!result.success) throw new Error(result.message);
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
      const result = await uploadProjectDocument(uploadTarget, file);
      if (!result.success) throw new Error(result.message);
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
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3, 4, 5].map((rowNumber) => (
                <TableRow key={rowNumber}>
                  <TableCell colSpan={4}>
                    <div className="h-10 animate-pulse rounded bg-muted" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <p className="font-medium">{project.name}</p>
                    <p className="max-w-sm truncate text-xs text-muted-foreground">
                      {project.description || "No description"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusStyles[project.status ?? "ACTIVE"] ??
                        "bg-muted text-muted-foreground"
                      }
                    >
                      {readable(project.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.createdAt
                      ? new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                        }).format(new Date(project.createdAt))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ${project.name}`}
                          />
                        }
                      >
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            const name = window.prompt(
                              "Project name",
                              project.name,
                            );
                            if (name?.trim())
                              void updateProject({
                                id: project.id,
                                name: name.trim(),
                              }).then(() => window.location.reload());
                          }}
                        >
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast.info("Team assignment", {
                              description:
                                "Team assignment controls are coming next.",
                            })
                          }
                        >
                          <Users /> Assign team
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setUploadTarget(project.id);
                            fileInput.current?.click();
                          }}
                        >
                          <Upload /> Upload document
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(project)}
                        >
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
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
          <span>{projects.total} projects</span>
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
              disabled={page >= projects.totalPages}
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
            <AlertDialogAction onClick={confirmDelete} disabled={false}>
              Delete project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
