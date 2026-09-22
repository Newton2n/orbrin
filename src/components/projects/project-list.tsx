"use client";

import { useEffect, useState } from "react";
import {
  deleteProject,
  deleteProjectDocument,
  getProjects,
  type PaginatedResponse,
  type Project,
  type ProjectListParams,
} from "@/actions/project.action";
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
import {
  Eye,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { ProjectDetailsDialog } from "./project-details-dialog";
import { ProjectFormDialog } from "./project-form-dialog";
import { ProjectTeamsDialog } from "./project-teams-dialog";

export type Role = "ADMIN" | "MANAGER" | "MEMBER";
export type ProjectListProps = {
  role: Role;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canUploadDocument?: boolean;
  canDeleteDocument?: boolean;
  canManageTeams?: boolean;
  canViewDetails?: boolean;
};

type FormState =
  | { mode: "create" }
  | { mode: "edit" | "upload" | "update-document"; project: Project }
  | null;
type ConfirmState = { kind: "project" | "document"; project: Project } | null;

export function ProjectList({
  role,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canUploadDocument = false,
  canDeleteDocument = false,
  canManageTeams = false,
  canViewDetails = false,
}: ProjectListProps) {
  const [result, setResult] = useState<PaginatedResponse<Project>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] =
    useState<ProjectListParams["sortBy"]>("createdAt");
  const [form, setForm] = useState<FormState>(null);
  const [details, setDetails] = useState<Project | null>(null);
  const [teamsProject, setTeamsProject] = useState<Project | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  async function loadProjects() {
    setLoading(true);
    const response = await getProjects({
      page,
      limit: 10,
      search: search || undefined,
      status: status || undefined,
      sortBy,
      sortOrder: "desc",
    });
    if (!response.ok) setError(response.message ?? "Unable to load projects.");
    else {
      setError(undefined);
      setResult(response.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadProjects();
  }, [page, search, status, sortBy]);

  async function confirmDelete() {
    if (!confirm) return;
    const response =
      confirm.kind === "project"
        ? await deleteProject(confirm.project.id)
        : await deleteProjectDocument(confirm.project.id);
    if (!response.ok) toast.error(response.message ?? "Unable to delete.");
    else {
      toast.success(response.message ?? "Deleted.");
      setConfirm(null);
      void loadProjects();
    }
  }

  const actionsVisible =
    canViewDetails ||
    canEdit ||
    canUploadDocument ||
    canManageTeams ||
    canDelete ||
    canDeleteDocument;
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
          <Input
            className="md:max-w-sm"
            placeholder="Search projects"
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
            <SelectTrigger className="md:w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="IN_PROGRESS">In progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy((value as ProjectListParams["sortBy"]) || "createdAt")
            }
          >
            <SelectTrigger className="md:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="updatedAt">Recently updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          {canCreate && (
            <Button
              className="md:ml-auto"
              onClick={() => setForm({ mode: "create" })}
            >
              <Plus />
              New project
            </Button>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            {role[0] + role.slice(1).toLowerCase()} projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="py-8 text-center text-muted-foreground">
              Loading projects...
            </p>
          )}
          {error && (
            <p className="rounded-md border border-destructive/30 p-4 text-destructive">
              {error}
            </p>
          )}
          {!loading && !error && !result?.items.length && (
            <p className="rounded-md border p-8 text-center text-muted-foreground">
              No projects found.
            </p>
          )}
          {!loading && !error && result?.items.length ? (
            <>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Teams</TableHead>
                      {actionsVisible && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.items.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          {project.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {project.status ?? "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {project.description || "No description"}
                        </TableCell>
                        <TableCell>
                          {project.documentUrl ? (
                            <a
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                              href={project.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FileText />
                              View
                            </a>
                          ) : (
                            "None"
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1">
                            <Users />
                            {project.teams?.length ?? 0}
                          </span>
                        </TableCell>
                        {actionsVisible && (
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              {canViewDetails && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="View details"
                                  onClick={() => setDetails(project)}
                                >
                                  <Eye />
                                </Button>
                              )}
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Edit project"
                                  onClick={() =>
                                    setForm({ mode: "edit", project })
                                  }
                                >
                                  <Pencil />
                                </Button>
                              )}
                              {canUploadDocument && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Upload document"
                                  onClick={() =>
                                    setForm({
                                      mode: project.documentUrl
                                        ? "update-document"
                                        : "upload",
                                      project,
                                    })
                                  }
                                >
                                  <Upload />
                                </Button>
                              )}
                              {canDeleteDocument && project.documentUrl && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Delete document"
                                  onClick={() =>
                                    setConfirm({ kind: "document", project })
                                  }
                                >
                                  <FileText />
                                </Button>
                              )}
                              {canManageTeams && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Manage teams"
                                  onClick={() => setTeamsProject(project)}
                                >
                                  <Users />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Delete project"
                                  onClick={() =>
                                    setConfirm({ kind: "project", project })
                                  }
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
              <div className="flex items-center justify-between pt-4 text-muted-foreground">
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
        <ProjectFormDialog
          open
          onOpenChange={(open) => !open && setForm(null)}
          {...form}
        />
      )}
      <ProjectDetailsDialog
        open={Boolean(details)}
        onOpenChange={(open) => !open && setDetails(null)}
        project={details}
        canManageTeams={canManageTeams}
        canEdit={canEdit}
        canDelete={canDelete}
        canUploadDocument={canUploadDocument}
        canDeleteDocument={canDeleteDocument}
        onEdit={() => details && setForm({ mode: "edit", project: details })}
        onDelete={() =>
          details && setConfirm({ kind: "project", project: details })
        }
        onUploadDocument={() =>
          details &&
          setForm({
            mode: details.documentUrl ? "update-document" : "upload",
            project: details,
          })
        }
        onDeleteDocument={() =>
          details && setConfirm({ kind: "document", project: details })
        }
      />
      {teamsProject && (
        <ProjectTeamsDialog
          open
          onOpenChange={(open) => !open && setTeamsProject(null)}
          projectId={teamsProject.id}
          canManageTeams={canManageTeams}
        />
      )}
      <DeleteConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void confirmDelete()}
        title={
          confirm?.kind === "document" ? "Delete document" : "Delete project"
        }
        description={
          confirm?.kind === "document"
            ? "This will permanently remove the project document."
            : `Delete ${confirm?.project.name ?? "this project"}? This cannot be undone.`
        }
      />
    </div>
  );
}
