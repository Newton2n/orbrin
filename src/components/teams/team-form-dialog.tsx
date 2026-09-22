"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createTeam, type Team, updateTeam } from "@/actions/team.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TeamFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & ({ mode: "create" } | { mode: "edit"; team: Team });

export function TeamFormDialog(props: TeamFormDialogProps) {
  const { open, onOpenChange, mode } = props;
  const team = mode === "edit" ? props.team : null;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(team?.name ?? "");
    setDescription(team?.description ?? "");
  }, [open, team]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Team name is required.");
      return;
    }
    setSaving(true);
    const result =
      mode === "create"
        ? await createTeam({
            name: name.trim(),
            description: description || undefined,
          })
        : team
          ? await updateTeam(team.id, { name: name.trim(), description })
          : null;
    setSaving(false);
    if (!result) return;
    if (!result.ok) {
      toast.error(result.message ?? "Unable to save team.");
      return;
    }
    toast.success(result.message ?? "Team saved.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create team" : "Edit team"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a team for your organization."
              : "Update the team details below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-description">Description</Label>
            <Textarea
              id="team-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Create team"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
