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
  if (Array.isArray(value)) {
    return value as AvailableMember[];
  }

  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;

    return memberList(source.members ?? source.items ?? source.data);
  }

  return [];
}

function getInitials(member: TeamMember) {
  return (
    member.user.fullName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

function MemberAvatar({
  member,
  small = false,
}: {
  member: TeamMember;
  small?: boolean;
}) {
  return (
    <div
      className={[
        "grid shrink-0 place-items-center rounded-full",
        "bg-primary/10 font-medium text-primary",
        small ? "size-8 text-[10px]" : "size-9 text-xs",
      ].join(" ")}
    >
      {getInitials(member)}
    </div>
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
    setLoadError(null);

    try {
      const [membersResult, usersResult] = await Promise.all([
        getTeamMembers(teamId),
        getOrganizationMembers(),
      ]);

      if (membersResult.ok) {
        setMembers(membersResult.data);
      } else {
        setLoadError(membersResult.message ?? "Unable to load team members.");
      }

      if (usersResult.success) {
        setAvailable(memberList(usersResult.data));
      } else {
        setLoadError(
          usersResult.message ?? "Unable to load organization members.",
        );
      }

      if (membersResult.ok && usersResult.success) {
        setLoadError(null);
      }
    } catch (error) {
      console.error(error);

      setLoadError(
        error instanceof Error ? error.message : "Unable to load team members.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      void loadMembers();
    }
  }, [open, teamId]);

  const unassigned = available.filter(
    (member) =>
      !members.some((teamMember) => teamMember.user.id === member.user.id),
  );

  async function handleAdd() {
    if (!selectedUser || saving) {
      return;
    }

    setSaving(true);

    try {
      const result = await addTeamMember(teamId, selectedUser);

      if (!result.ok) {
        toast.error(result.message ?? "Unable to add member.");
        return;
      }

      toast.success(result.message ?? "Member added.");

      setSelectedUser("");

      await loadMembers();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "Unable to add member.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!removeUser || saving) {
      return;
    }

    setSaving(true);

    try {
      const result = await removeTeamMember(teamId, removeUser.user.id);

      if (!result.ok) {
        toast.error(result.message ?? "Unable to remove member.");
        return;
      }

      toast.success(result.message ?? "Member removed.");

      setRemoveUser(null);

      await loadMembers();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error ? error.message : "Unable to remove member.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-5 py-4 sm:px-6">
            <DialogTitle className="text-base sm:text-lg">
              Team members
            </DialogTitle>

            <DialogDescription className="text-xs sm:text-sm">
              Manage the members assigned to this team.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-6 p-5 sm:p-6">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
                    <span>Loading members...</span>
                  </div>
                </div>
              ) : loadError ? (
                <ErrorState
                  compact
                  description={loadError}
                  onRetry={() => void loadMembers()}
                />
              ) : (
                <>
                  <section className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium">Current members</h3>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {members.length === 0
                          ? "No members assigned"
                          : `${members.length} ${
                              members.length === 1 ? "member" : "members"
                            }`}
                      </p>
                    </div>

                    {members.length === 0 ? (
                      <div className="rounded-md border border-dashed px-4 py-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          No members assigned to this team yet.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-md border">
                        {members.map((member, index) => (
                          <div
                            key={member.user.id}
                            className={[
                              "flex min-w-0 items-center gap-3 px-3 py-3",
                              index !== members.length - 1 ? "border-b" : "",
                            ].join(" ")}
                          >
                            <MemberAvatar member={member} />

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {member.user.fullName}
                              </p>

                              <p className="truncate text-xs text-muted-foreground">
                                {member.user.email}
                              </p>
                            </div>

                            {member.role && (
                              <span className="hidden shrink-0 rounded-md bg-muted px-2 py-1 text-[10px] font-medium uppercase text-muted-foreground sm:block">
                                {member.role}
                              </span>
                            )}

                            {canManageMembers && (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={saving}
                                className="h-8 shrink-0 px-2 text-xs text-muted-foreground hover:text-destructive"
                                onClick={() => setRemoveUser(member)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {canManageMembers && (
                    <section className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium">Add member</h3>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Select someone from your organization.
                        </p>
                      </div>

                      {unassigned.length === 0 ? (
                        <div className="rounded-md border border-dashed px-4 py-4 text-center">
                          <p className="text-xs text-muted-foreground">
                            All organization members are already assigned.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Select
                            value={selectedUser}
                            onValueChange={(value) => {
                              setSelectedUser(value ?? "");
                            }}
                          >
                            <SelectTrigger className="w-full min-w-0 sm:flex-1">
                              <SelectValue placeholder="Select a member" />
                            </SelectTrigger>

                            <SelectContent className="max-h-80">
                              {unassigned.map((member) => (
                                <SelectItem
                                  key={member.user.id}
                                  value={member.user.id}
                                  className="py-3"
                                >
                                  <div className="flex min-w-0 cursor-pointer items-start gap-3">
                                    <MemberAvatar member={member} small />

                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-medium">
                                        {member.user.fullName}
                                      </p>

                                      <p className="truncate text-xs text-muted-foreground">
                                        {member.user.email}
                                      </p>

                                      {member.role && (
                                        <span className="mt-1 inline-flex rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                                          {member.role}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            disabled={!selectedUser || saving}
                            onClick={() => void handleAdd()}
                            className="w-full sm:w-20"
                          >
                            {saving ? "Adding..." : "Add"}
                          </Button>
                        </div>
                      )}
                    </section>
                  )}
                </>
              )}
            </div>
          </div>

          <DialogFooter className="border-t px-5 py-3 sm:px-6">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={Boolean(removeUser)}
        onOpenChange={(value) => {
          if (!value && !saving) {
            setRemoveUser(null);
          }
        }}
        onCancel={() => {
          if (!saving) {
            setRemoveUser(null);
          }
        }}
        onConfirm={() => void handleRemove()}
        title="Remove team member"
        description={`Remove ${
          removeUser?.user.fullName ?? "this member"
        } from the team?`}
      />
    </>
  );
}
