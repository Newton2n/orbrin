"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getOrganizationMembers } from "@/actions/organization.action";
import {
  addTeamMember,
  getTeamMembers,
  removeTeamMember,
  type TeamMember,
} from "@/actions/team.action";
import { ErrorState } from "@/components/shared/error-state";
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
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

type TeamMembersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  canManageMembers: boolean;
};

type AvailableMember = TeamMember;

function memberList(value: unknown): AvailableMember[] {
  if (Array.isArray(value)) return value as AvailableMember[];
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    return memberList(source.members ?? source.items ?? source.data);
  }
  return [];
}

function initials(member: TeamMember) {
  return (
    member.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

export function TeamMembersDialog({
  open,
  onOpenChange,
  teamId,
  canManageMembers,
}: TeamMembersDialogProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [available, setAvailable] = useState<AvailableMember[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [removeUser, setRemoveUser] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function loadMembers() {
    setLoading(true);
    const [membersResult, usersResult] = await Promise.all([
      getTeamMembers(teamId),
      getOrganizationMembers(),
    ]);
    if (membersResult.ok) setMembers(membersResult.data);
    else setLoadError(membersResult.message ?? "Unable to load team members.");
    if (usersResult.success) setAvailable(memberList(usersResult.data));
    else
      setLoadError(
        usersResult.message ?? "Unable to load organization members.",
      );
    if (membersResult.ok && usersResult.success) setLoadError(null);
    setLoading(false);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: reload when this dialog or team changes
  useEffect(() => {
    if (open) void loadMembers();
  }, [open, teamId]);

  const unassigned = available.filter(
    (member) => !members.some((item) => item.id === member.id),
  );

  async function handleAdd() {
    if (!selectedUser) return;
    setSaving(true);
    const result = await addTeamMember(teamId, selectedUser);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message ?? "Unable to add member.");
      return;
    }
    toast.success(result.message ?? "Member added.");
    setSelectedUser("");
    void loadMembers();
  }

  async function handleRemove() {
    if (!removeUser) return;
    setSaving(true);
    const result = await removeTeamMember(teamId, removeUser.id);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message ?? "Unable to remove member.");
      return;
    }
    toast.success(result.message ?? "Member removed.");
    setRemoveUser(null);
    void loadMembers();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Team members</DialogTitle>
            <DialogDescription>
              Review membership and keep the team roster current.
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <p className="py-6 text-center text-muted-foreground">
              Loading members...
            </p>
          ) : loadError ? (
            <ErrorState
              compact
              description={loadError}
              onRetry={() => void loadMembers()}
            />
          ) : (
            <div className="space-y-3">
              {members.length === 0 ? (
                <p className="rounded-lg border border-dashed p-5 text-center text-muted-foreground">
                  No members assigned yet.
                </p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials(member)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{member.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                    {member.role && (
                      <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {member.role}
                      </span>
                    )}
                    {canManageMembers && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={saving}
                        onClick={() => setRemoveUser(member)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))
              )}
              {canManageMembers && (
                <div className="flex gap-2 border-t pt-3">
                  <Select
                    value={selectedUser}
                    onValueChange={(value) => setSelectedUser(value ?? "")}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select an organization member" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassigned.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    disabled={!selectedUser || saving}
                    onClick={() => void handleAdd()}
                  >
                    Add member
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
      <DeleteConfirmDialog
        open={Boolean(removeUser)}
        onOpenChange={(value) => !value && setRemoveUser(null)}
        onCancel={() => setRemoveUser(null)}
        onConfirm={() => void handleRemove()}
        title="Remove team member"
        description={`Remove ${removeUser?.name ?? "this member"} from the team?`}
      />
    </>
  );
}
