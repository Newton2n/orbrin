"use client";

import { useEffect, useState } from "react";
import {
  assignTeamToProject,
  getProjectTeams,
  removeTeamFromProject,
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
  projectId: string;
  canManageTeams: boolean;
};

function teamList(value: unknown): Team[] {
  if (Array.isArray(value)) return value as Team[];
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    return teamList(source.data ?? source.teams ?? source.items);
  }
  return [];
}

export function ProjectTeamsDialog({
  projectId,
  open,
  onOpenChange,
  canManageTeams,
}: ProjectTeamsDialogProps) {
  const [assigned, setAssigned] = useState<Team[]>([]);
  const [available, setAvailable] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadTeams() {
    setLoading(true);
    const [assignedResult, allResult] = await Promise.all([
      getProjectTeams(projectId),
      getTeams(),
    ]);
    if (assignedResult.ok) setAssigned(assignedResult.data);
    else
      toast.error(assignedResult.message ?? "Unable to load assigned teams.");
    if (allResult.success) setAvailable(teamList(allResult.data));
    else toast.error(allResult.message ?? "Unable to load teams.");
    setLoading(false);
  }

  useEffect(() => {
    if (open) void loadTeams();
  }, [open, projectId]);

  const unassigned = available.filter(
    (team) => !assigned.some((item) => item.id === team.id),
  );

  async function addTeam() {
    if (!selectedTeam) return;
    setSaving(true);
    const result = await assignTeamToProject(projectId, selectedTeam);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message ?? "Unable to assign team.");
      return;
    }
    toast.success(result.message ?? "Team assigned.");
    setSelectedTeam("");
    void loadTeams();
  }

  async function removeTeam(teamId: string) {
    setSaving(true);
    const result = await removeTeamFromProject(projectId, teamId);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message ?? "Unable to remove team.");
      return;
    }
    toast.success(result.message ?? "Team removed.");
    void loadTeams();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Project teams</DialogTitle>
          <DialogDescription>
            Teams assigned to this project and their member counts.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="text-muted-foreground">Loading teams...</p>
        ) : (
          <div className="space-y-3">
            {assigned.length === 0 ? (
              <p className="rounded-md border p-3 text-muted-foreground">
                No teams assigned.
              </p>
            ) : (
              assigned.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-muted-foreground">
                      {team.memberCount ?? team.members?.length ?? 0} members
                    </p>
                  </div>
                  {canManageTeams && (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={saving}
                      onClick={() => void removeTeam(team.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))
            )}
            {canManageTeams && (
              <div className="flex gap-2 pt-2">
                <Select
                  value={selectedTeam}
                  onValueChange={(value) => setSelectedTeam(value ?? "")}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassigned.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={!selectedTeam || saving}
                  onClick={() => void addTeam()}
                >
                  Add team
                </Button>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
