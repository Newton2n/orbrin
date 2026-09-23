"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  assignTeamToProject,
  getProjectById,
  removeTeamFromProject,
  type Project,
  type Team,
} from "@/actions/project.action";

import { getTeams } from "@/actions/team.action";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";

type ProjectTeamsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  role: "ADMIN" | "MANAGER" | "MEMBER";
  canManageTeams: boolean;
};

function normalizeTeams(value: unknown): Team[] {
  if (Array.isArray(value)) {
    return value as Team[];
  }

  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;

    if (Array.isArray(source.data)) {
      return source.data as Team[];
    }

    if (Array.isArray(source.teams)) {
      return source.teams as Team[];
    }

    if (Array.isArray(source.items)) {
      return source.items as Team[];
    }
  }

  return [];
}

export function ProjectTeamsDialog({
  open,
  onOpenChange,
  project,
  role,
  canManageTeams,
}: ProjectTeamsDialogProps) {
  const [currentProject, setCurrentProject] =
    useState<Project>(project);

  const [allTeams, setAllTeams] = useState<Team[]>([]);

  const [selectedTeam, setSelectedTeam] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  const loadTeams = useCallback(async () => {
    setLoading(true);

    try {
      const [projectResult, teamsResult] = await Promise.all([
        getProjectById(project.id),
        getTeams(),
      ]);

      if (!projectResult.ok) {
        toast.error(
          projectResult.message ??
            "Unable to load project teams.",
        );
        return;
      }

      if (projectResult.data) {
        setCurrentProject(projectResult.data);
      }

      if (!teamsResult.success) {
        toast.error(
          teamsResult.message ?? "Unable to load teams.",
        );
        return;
      }

      setAllTeams(normalizeTeams(teamsResult.data));
    } catch {
      toast.error("Unable to load teams.");
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    if (open) {
      void loadTeams();
    }
  }, [open, loadTeams]);

  const assignedTeamIds = useMemo(
    () =>
      new Set(
        (currentProject.teams ?? []).map(
          (team) => team.teamId,
        ),
      ),
    [currentProject.teams],
  );

  const assignedTeams = allTeams.filter((team) =>
    assignedTeamIds.has(team.id),
  );

  const availableTeams = allTeams.filter(
    (team) => !assignedTeamIds.has(team.id),
  );

  async function handleAssign() {
    if (!selectedTeam) return;

    setSaving(true);

    try {
      const result = await assignTeamToProject(
        project.id,
        selectedTeam,
      );

      if (!result.ok) {
        toast.error(
          result.message ?? "Unable to assign team.",
        );
        return;
      }

      toast.success(
        result.message ??
          "Team assigned to project successfully.",
      );

      setSelectedTeam("");

      await loadTeams();
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(teamId: string) {
    const team = allTeams.find(
      (item) => item.id === teamId,
    );

    const confirmed = window.confirm(
      `Remove ${
        team?.name ?? "this team"
      } from the project?`,
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      const result = await removeTeamFromProject(
        project.id,
        teamId,
      );

      if (!result.ok) {
        toast.error(
          result.message ??
            "Unable to remove team.",
        );
        return;
      }

      toast.success(
        result.message ??
          "Team removed from project successfully.",
      );

      await loadTeams();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Project teams
          </DialogTitle>

          <DialogDescription>
            Manage teams assigned to{" "}
            <strong>{project.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading teams...
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Assigned teams
              </p>

              {assignedTeams.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No teams assigned to this project.
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between gap-3 rounded-md border p-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          {team.name}
                        </p>
                      </div>

                      {canManageTeams && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={saving}
                          onClick={() =>
                            void handleRemove(
                              team.id,
                            )
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {canManageTeams && (
              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium">
                  Assign a team
                </p>

                <div className="flex gap-2">
                  <Select
                    value={selectedTeam}
                    onValueChange={(value) => {
                      if (value === null) {
                        setSelectedTeam("");
                        return;
                      }

                      setSelectedTeam(value);
                    }}
                    disabled={saving}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>

                    <SelectContent>
                      {availableTeams.length === 0 ? (
                        <SelectItem
                          value="none"
                          disabled
                        >
                          No available teams
                        </SelectItem>
                      ) : (
                        availableTeams.map((team) => (
                          <SelectItem
                            key={team.id}
                            value={team.id}
                          >
                            {team.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  <Button
                    disabled={!selectedTeam || saving}
                    onClick={() =>
                      void handleAssign()
                    }
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {!canManageTeams &&
              role === "MEMBER" && (
                <p className="text-xs text-muted-foreground">
                  Members can view project teams but
                  cannot change assignments.
                </p>
              )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}