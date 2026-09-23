"use client";

import { useEffect, useState } from "react";

import {
  getAllProjects,
  type Project,
} from "@/actions/project.action";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  FolderKanban,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

import { SprintList } from "./sprint-list";

type SprintProjectDirectoryProps = {
  role: "ADMIN" | "MANAGER" | "MEMBER";
};

export function SprintProjectDirectory({
  role,
}: SprintProjectDirectoryProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        setLoading(true);

        const result = await getAllProjects({
          page: 1,
          limit: 100,
          sortBy: "updatedAt",
          sortOrder: "desc",
        });

        if (cancelled) {
          return;
        }

        if (!result.ok) {
          toast.error(
            result.message ?? "Unable to load projects.",
          );

          setProjects([]);
          return;
        }

        setProjects(
          result.data?.projects ?? [],
        );
      } catch {
        if (!cancelled) {
          toast.error("Unable to load projects.");
          setProjects([]);
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
  }, []);

  function handleOpen(project: Project) {
    setSelectedProject(project);
    setDialogOpen(true);
  }

  function handleDialogChange(open: boolean) {
    setDialogOpen(open);

    if (!open) {
      setSelectedProject(null);
    }
  }

  const canManage = role !== "MEMBER";

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-xl border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading projects...
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-10 text-center sm:py-14">
        <FolderKanban className="mx-auto size-8 text-muted-foreground" />

        <h3 className="mt-4 font-semibold">
          No projects found
        </h3>

        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          There are no projects available for your account yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="flex min-w-0 flex-col overflow-hidden"
          >
            <CardHeader className="p-4 sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                  <FolderKanban className="size-4 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-base">
                    {project.name}
                  </CardTitle>

                  <CardDescription className="mt-1 line-clamp-2 text-sm">
                    {project.description ||
                      "No project description provided."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="mt-auto p-4 pt-0 sm:p-5 sm:pt-0">
              <Button
                className="w-full"
                size="sm"
                onClick={() => handleOpen(project)}
              >
                View sprints
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      >
        <DialogContent
          className="
            flex
            h-[100dvh]
            max-h-[100dvh]
            w-full
            max-w-none
            flex-col
            gap-0
            overflow-hidden
            rounded-none
            border-0
            p-0

            sm:h-[90vh]
            sm:max-h-[90vh]
            sm:w-[calc(100%-2rem)]
            sm:max-w-6xl
            sm:rounded-xl
            sm:border
          "
        >
          <DialogHeader
            className="
              shrink-0
              border-b
              px-4
              py-3
              pr-12

              sm:px-5
              sm:py-4
              sm:pr-14
            "
          >
            <DialogTitle className="truncate text-base sm:text-lg">
              {selectedProject?.name ??
                "Project sprints"}
            </DialogTitle>

            <DialogDescription className="truncate text-xs sm:text-sm">
              {canManage
                ? "Manage sprints, timelines, and delivery goals."
                : "View sprints, timelines, and delivery progress."}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {selectedProject ? (
              <div className="p-3 sm:p-5">
                <SprintList
                  projectId={selectedProject.id}
                  role={role}
                  canCreate={canManage}
                  canEdit={canManage}
                  canDelete={canManage}
                  canViewDetails
                />
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}