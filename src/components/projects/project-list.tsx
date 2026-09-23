"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  deleteProject,
  deleteProjectDocument,
  getAllProjects,
  type Project,
} from "@/actions/project.action";
import { getTeams } from "@/actions/team.action";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { toast } from "sonner";

import { ProjectDetailsDialog } from "./project-details-dialog";
import { ProjectFormDialog } from "./project-form-dialog";

type ProjectListProps = {
  role: "ADMIN" | "MANAGER" | "MEMBER";
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canUploadDocument?: boolean;
  canDeleteDocument?: boolean;
  canManageTeams?: boolean;
  canViewDetails?: boolean;
};

type TeamOption = {
  id: string;
  name: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function normalizeTeams(value: unknown): TeamOption[] {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object",
      )
      .map((item) => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? item.title ?? "Unnamed team"),
      }))
      .filter((team) => team.id);
  }

  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;

    if (Array.isArray(source.data)) {
      return normalizeTeams(source.data);
    }

    if (Array.isArray(source.teams)) {
      return normalizeTeams(source.teams);
    }

    if (Array.isArray(source.items)) {
      return normalizeTeams(source.items);
    }
  }

  return [];
}

function statusLabel(status?: string | null) {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusVariant(
  status?: string | null,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "COMPLETED":
      return "default";

    case "IN_PROGRESS":
      return "secondary";

    case "ARCHIVED":
      return "outline";

    case "ACTIVE":
    case "active":
      return "default";

    default:
      return "outline";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getProjectDetailsPath(
  role: ProjectListProps["role"],
  projectId: string,
) {
  return `/dashboard/${role.toLowerCase()}/projects/${projectId}`;
}

export function ProjectList({
  role,
  canCreate = false,
  canEdit = false,
  canDelete = false,
  canUploadDocument = false,
  canDeleteDocument = false,
  canManageTeams = false,
  canViewDetails = true,
}: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);

  const [pagination, setPagination] =
    useState<Pagination>(DEFAULT_PAGINATION);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("all");
  const [teamId, setTeamId] = useState("all");

  const [sortBy, setSortBy] = useState<
    "name" | "createdAt" | "updatedAt"
  >("createdAt");

  const [sortOrder, setSortOrder] =
    useState<"asc" | "desc">("desc");

  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [formMode, setFormMode] = useState<
    "create" | "edit" | "upload" | null
  >(null);

  const [formProject, setFormProject] =
    useState<Project | null>(null);

  function getProjectQuery() {
    return {
      page,
      limit,
      ...(search ? { search } : {}),
      sortBy,
      sortOrder,
      ...(status !== "all" ? { status } : {}),
      ...(teamId !== "all" ? { teamId } : {}),
    };
  }

  useEffect(() => {
    let cancelled = false;

    async function loadTeams() {
      setTeamsLoading(true);

      try {
        const result = await getTeams();

        if (cancelled) return;

        if (!result.success) {
          toast.error(
            result.message ?? "Unable to load teams.",
          );
          setTeams([]);
          return;
        }

        setTeams(normalizeTeams(result.data));
      } catch {
        if (!cancelled) {
          toast.error("Unable to load teams.");
          setTeams([]);
        }
      } finally {
        if (!cancelled) {
          setTeamsLoading(false);
        }
      }
    }

    void loadTeams();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      setLoading(true);

      try {
        const result = await getAllProjects(getProjectQuery());

        if (cancelled) return;

        if (!result.ok) {
          toast.error(
            result.message ?? "Unable to load projects.",
          );
          setProjects([]);
          setPagination(DEFAULT_PAGINATION);
          return;
        }

        setProjects(result.data?.projects ?? []);
        setPagination(
          result.data?.pagination ?? DEFAULT_PAGINATION,
        );
      } catch {
        if (!cancelled) {
          toast.error("Unable to load projects.");
          setProjects([]);
          setPagination(DEFAULT_PAGINATION);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, [
    page,
    limit,
    search,
    status,
    teamId,
    sortBy,
    sortOrder,
  ]);

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setTeamId("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  }

  const hasActiveFilters =
    search.length > 0 ||
    status !== "all" ||
    teamId !== "all" ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  function openDetails(project: Project) {
    setSelectedProject(project);
    setDetailsOpen(true);
  }

  function openEdit(project: Project) {
    setFormProject(project);
    setFormMode("edit");
  }

  function openUpload(project: Project) {
    setFormProject(project);
    setFormMode("upload");
  }

  async function refreshProjects() {
    setLoading(true);

    try {
      const result = await getAllProjects(getProjectQuery());

      if (!result.ok) {
        toast.error(
          result.message ?? "Unable to refresh projects.",
        );
        return;
      }

      setProjects(result.data?.projects ?? []);
      setPagination(
        result.data?.pagination ?? DEFAULT_PAGINATION,
      );
    } catch {
      toast.error("Unable to refresh projects.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(project: Project) {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This will soft-delete the project.`,
    );

    if (!confirmed) return;

    const result = await deleteProject(project.id);

    if (!result.ok) {
      toast.error(
        result.message ?? "Unable to delete project.",
      );
      return;
    }

    toast.success(
      result.message ?? "Project deleted successfully.",
    );

    if (selectedProject?.id === project.id) {
      setSelectedProject(null);
      setDetailsOpen(false);
    }

    if (projects.length === 1 && page > 1) {
      setPage((current) => Math.max(1, current - 1));
      return;
    }

    await refreshProjects();
  }

  async function handleDeleteDocument(project: Project) {
    const confirmed = window.confirm(
      `Delete the document from "${project.name}"?`,
    );

    if (!confirmed) return;

    const result = await deleteProjectDocument(project.id);

    if (!result.ok) {
      toast.error(
        result.message ??
          "Unable to delete project document.",
      );
      return;
    }

    toast.success(
      result.message ??
        "Project document deleted successfully.",
    );

    if (selectedProject?.id === project.id) {
      setSelectedProject({
        ...selectedProject,
        documentUrl: null,
        documentPublicId: null,
      });
    }

    await refreshProjects();
  }

  function handleFormClose(open: boolean) {
    if (open) return;

    setFormMode(null);
    setFormProject(null);

    void refreshProjects();
  }

  const pageNumbers = useMemo(() => {
    const total = pagination.totalPages;

    if (total <= 1) {
      return [];
    }

    const current = pagination.page;

    const pages: (
      | number
      | "ellipsis-left"
      | "ellipsis-right"
    )[] = [];

    if (total <= 7) {
      for (let index = 1; index <= total; index += 1) {
        pages.push(index);
      }

      return pages;
    }

    pages.push(1);

    if (current > 4) {
      pages.push("ellipsis-left");
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let index = start; index <= end; index += 1) {
      pages.push(index);
    }

    if (current < total - 3) {
      pages.push("ellipsis-right");
    }

    pages.push(total);

    return pages;
  }, [pagination.page, pagination.totalPages]);

  const showingFrom =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1;

  const showingTo =
    pagination.total === 0
      ? 0
      : Math.min(
          pagination.page * pagination.limit,
          pagination.total,
        );

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative w-full flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.target.value)
                  }
                  placeholder="Search projects..."
                  className="pl-9 pr-9"
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {canCreate && (
                <Button
                  onClick={() => {
                    setFormProject(null);
                    setFormMode("create");
                  }}
                  className="w-full shrink-0 sm:w-auto"
                >
                  <Plus className="mr-2 size-4" />
                  Create project
                </Button>
              )}
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />

              <span className="text-sm font-medium">
                Filters & sorting
              </span>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="ml-auto"
                >
                  <X className="mr-1 size-3.5" />
                  Clear filters
                </Button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Status
                </label>

                <Select
                  value={status}
                  onValueChange={(value) => {
                    if (value === null) return;

                    setStatus(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      All statuses
                    </SelectItem>

                    <SelectItem value="active">
                      Active
                    </SelectItem>

                    <SelectItem value="IN_PROGRESS">
                      In progress
                    </SelectItem>

                    <SelectItem value="COMPLETED">
                      Completed
                    </SelectItem>

                    <SelectItem value="ARCHIVED">
                      Archived
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Team
                </label>

                <Select
                  value={teamId}
                  onValueChange={(value) => {
                    if (value === null) return;

                    setTeamId(value);
                    setPage(1);
                  }}
                  disabled={teamsLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        teamsLoading
                          ? "Loading teams..."
                          : "All teams"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      All teams
                    </SelectItem>

                    {teams.map((team) => (
                      <SelectItem
                        key={team.id}
                        value={team.id}
                      >
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Sort by
                </label>

                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    if (value === null) return;

                    if (
                      value !== "name" &&
                      value !== "createdAt" &&
                      value !== "updatedAt"
                    ) {
                      return;
                    }

                    setSortBy(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="createdAt">
                      Created date
                    </SelectItem>

                    <SelectItem value="updatedAt">
                      Updated date
                    </SelectItem>

                    <SelectItem value="name">
                      Name
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Order
                </label>

                <Select
                  value={sortOrder}
                  onValueChange={(value) => {
                    if (value === null) return;

                    if (
                      value !== "asc" &&
                      value !== "desc"
                    ) {
                      return;
                    }

                    setSortOrder(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="size-3.5 shrink-0" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="desc">
                      Descending
                    </SelectItem>

                    <SelectItem value="asc">
                      Ascending
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Per page
                </label>

                <Select
                  value={String(limit)}
                  onValueChange={(value) => {
                    if (value === null) return;

                    const nextLimit = Number(value);

                    if (!Number.isFinite(nextLimit)) {
                      return;
                    }

                    setLimit(nextLimit);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="10">
                      10 projects
                    </SelectItem>

                    <SelectItem value="20">
                      20 projects
                    </SelectItem>

                    <SelectItem value="50">
                      50 projects
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {search && (
              <p className="text-xs text-muted-foreground">
                Searching for:{" "}
                <span className="font-medium text-foreground">
                  &quot;{search}&quot;
                </span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="rounded-lg border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Loading projects...
          </p>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center sm:p-10">
          <p className="font-medium">No projects found</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try changing your search or filters."
              : canCreate
                ? "Create your first project to get started."
                : "There are no projects available for your account."}
          </p>

          {hasActiveFilters && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={resetFilters}
            >
              Clear filters
            </Button>
          )}

          {!hasActiveFilters && canCreate && (
            <Button
              className="mt-4"
              onClick={() => {
                setFormProject(null);
                setFormMode("create");
              }}
            >
              <Plus className="mr-2 size-4" />
              Create project
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="flex min-w-0 flex-col overflow-hidden"
              >
                <CardHeader className="space-y-3">
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="break-words">
                        {project.name}
                      </CardTitle>

                      <CardDescription className="mt-2 line-clamp-3 break-words">
                        {project.description ||
                          "No description"}
                      </CardDescription>
                    </div>

                    <Badge
                      variant={statusVariant(project.status)}
                      className="w-fit shrink-0"
                    >
                      {statusLabel(project.status)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="mt-auto space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="text-muted-foreground">
                        Teams
                      </p>

                      <p className="font-medium">
                        {project.teams?.length ?? 0}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-muted-foreground">
                        Tasks
                      </p>

                      <p className="font-medium">
                        {project.tasks?.length ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Updated {formatDate(project.updatedAt)}
                  </div>

                  {project.documentUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <a
                        href={project.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View document
                      </a>
                    </Button>
                  )}

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {canViewDetails && (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <Link
                          href={getProjectDetailsPath(
                            role,
                            project.id,
                          )}
                        >
                          <ExternalLink className="mr-2 size-4" />
                          View project
                        </Link>
                      </Button>
                    )}

                    {canViewDetails && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          openDetails(project)
                        }
                      >
                        Quick details
                      </Button>
                    )}

                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          openEdit(project)
                        }
                      >
                        Edit
                      </Button>
                    )}

                    {canDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          void handleDelete(project)
                        }
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination.total > 0 && (
            <div className="flex flex-col gap-4 border-t pt-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {showingFrom}
                </span>
                {" – "}
                <span className="font-medium text-foreground">
                  {showingTo}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {pagination.total}
                </span>{" "}
                projects
              </p>

              <div className="w-full overflow-x-auto pb-1 lg:w-auto">
                <div className="flex min-w-max items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={
                      !pagination.hasPreviousPage ||
                      loading
                    }
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1),
                      )
                    }
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>

                  {pageNumbers.map((pageNumber) => {
                    if (
                      pageNumber === "ellipsis-left" ||
                      pageNumber === "ellipsis-right"
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="flex size-9 items-center justify-center text-sm text-muted-foreground"
                        >
                          ...
                        </span>
                      );
                    }

                    const active =
                      pageNumber === pagination.page;

                    return (
                      <Button
                        key={pageNumber}
                        variant={
                          active ? "default" : "outline"
                        }
                        size="icon"
                        disabled={loading}
                        onClick={() =>
                          setPage(pageNumber)
                        }
                        aria-label={`Go to page ${pageNumber}`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="icon"
                    disabled={
                      !pagination.hasNextPage ||
                      loading
                    }
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                    aria-label="Next page"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <ProjectDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        project={selectedProject}
        role={role}
        canManageTeams={canManageTeams}
        canEdit={canEdit}
        canDelete={canDelete}
        canUploadDocument={canUploadDocument}
        canDeleteDocument={canDeleteDocument}
        onEdit={() => {
          if (!selectedProject) return;

          setDetailsOpen(false);
          openEdit(selectedProject);
        }}
        onDelete={() => {
          if (!selectedProject) return;

          void handleDelete(selectedProject);
        }}
        onUploadDocument={() => {
          if (!selectedProject) return;

          setDetailsOpen(false);
          openUpload(selectedProject);
        }}
        onDeleteDocument={() => {
          if (!selectedProject) return;

          void handleDeleteDocument(selectedProject);
        }}
      />

      {/* Create mode */}
      {formMode === "create" && (
        <ProjectFormDialog
          open
          onOpenChange={handleFormClose}
          mode="create"
        />
      )}

      {/* Edit mode */}
      {formMode === "edit" && formProject && (
        <ProjectFormDialog
          open
          onOpenChange={handleFormClose}
          mode="edit"
          project={formProject}
        />
      )}

      {/* Upload mode */}
      {formMode === "upload" && formProject && (
        <ProjectFormDialog
          open
          onOpenChange={handleFormClose}
          mode="upload"
          project={formProject}
        />
      )}
    </div>
  );
}