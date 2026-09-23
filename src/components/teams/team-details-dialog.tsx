"use client";

import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getTeamMembers,
  type Team,
  type TeamMember,
} from "@/actions/team.action";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { TeamMembersDialog } from "./team-members-dialog";

type TeamDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
  canManageMembers?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

function initials(member: TeamMember) {
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

export function TeamDetailsDialog({
  open,
  onOpenChange,
  team,
  canManageMembers = false,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
}: TeamDetailsDialogProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [membersOpen, setMembersOpen] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (!open || !team) {
      return;
    }

    let cancelled = false;

    async function loadMembers() {
      setLoadingMembers(true);

      try {
        const result = await getTeamMembers(team?.id as string);

        if (cancelled) {
          return;
        }

        if (result.ok) {
          setMembers(result.data);
        } else {
          toast.error(result.message ?? "Unable to load team members.");
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load team members.",
        );
      } finally {
        if (!cancelled) {
          setLoadingMembers(false);
        }
      }
    }

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [open, team]);

  if (!team) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{team.name}</DialogTitle>

            <DialogDescription>
              Team profile, membership, and workspace details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </p>

              <p className="mt-1 text-sm">
                {team.description || "No description"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Members
              </p>

              <p className="mt-1 text-sm">
                {loadingMembers
                  ? "Loading..."
                  : `${members.length} ${
                      members.length === 1 ? "person" : "people"
                    }`}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Created
              </p>

              <p className="mt-1 text-sm">
                {team.createdAt
                  ? new Date(team.createdAt).toLocaleString()
                  : "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Updated
              </p>

              <p className="mt-1 text-sm">
                {team.updatedAt
                  ? new Date(team.updatedAt).toLocaleString()
                  : "Unknown"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-sm font-medium">Members</h3>

                <p className="text-xs text-muted-foreground">
                  People currently assigned to this team.
                </p>
              </div>

              <Users className="size-4 text-muted-foreground" />
            </div>

            {loadingMembers ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading members...
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No members assigned.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {members.slice(0, 6).map((member) => (
                  <div
                    key={member.user.id}
                    className="flex min-w-0 items-center gap-2 rounded-md bg-muted/50 p-2"
                  >
                    <div className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                      {initials(member)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {member.user.fullName}
                      </p>

                      <p className="truncate text-[11px] text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>

                    {member.role && (
                      <Badge
                        variant="secondary"
                        className="ml-auto shrink-0 text-[10px]"
                      >
                        {member.role}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex w-full flex-wrap justify-end gap-2">
              {canManageMembers && (
                <Button variant="outline" onClick={() => setMembersOpen(true)}>
                  Manage members
                </Button>
              )}

              {canEdit && (
                <Button variant="outline" onClick={onEdit}>
                  Edit
                </Button>
              )}

              {canDelete && (
                <Button variant="destructive" onClick={onDelete}>
                  Delete team
                </Button>
              )}

              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TeamMembersDialog
        open={membersOpen}
        onOpenChange={setMembersOpen}
        teamId={team.id}
        canManageMembers={canManageMembers}
      />
    </>
  );
}
