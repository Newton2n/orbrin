"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getOrganizationMemberById,
  type OrganizationMember,
  type OrganizationRole,
} from "@/actions/organization.action";
import { AvatarWithFallback } from "@/components/avatar-with-fallback";
import { DialogErrorState } from "@/components/shared/dialog-error-state";
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
import { MemberRoleDialog } from "./member-role-dialog";
import { MemberStatusDialog } from "./member-status-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";

export function MemberDetailsDialog({
  open,
  onOpenChange,
  memberId,
  currentUserRole,
  canManageMembers,
  canRemoveMembers,
  onMemberChanged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string | null;
  currentUserRole: OrganizationRole;
  canManageMembers: boolean;
  canRemoveMembers: boolean;
  onMemberChanged?: () => void;
}) {
  const [member, setMember] = useState<OrganizationMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  async function load() {
    if (!memberId) return;
    setLoading(true);
    const result = await getOrganizationMemberById(memberId);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
      setMember(null);
      return;
    }
    setError(null);
    setMember(result.data);
  }
  // Reload when the selected member dialog opens.
  // biome-ignore lint/correctness/useExhaustiveDependencies: load is intentionally scoped to the selected member
  useEffect(() => {
    if (open) void load();
    else setMember(null);
  }, [open, memberId]);
  const user = member?.user;
  const changed = () => {
    void load();
    onMemberChanged?.();
  };
  const canEdit =
    canManageMembers &&
    currentUserRole !== "MEMBER" &&
    member?.role !== "ADMIN";
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Member details</DialogTitle>
            <DialogDescription>
              Review organization access and membership information.
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <p className="py-8 text-center text-muted-foreground">
              Loading member...
            </p>
          ) : error ? (
            <DialogErrorState
              message={error}
              onRetry={() => void load()}
              onClose={() => onOpenChange(false)}
            />
          ) : !member ? (
            <p className="py-8 text-center text-muted-foreground">
              Member not found.
            </p>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <AvatarWithFallback
                  name={user?.fullName}
                  imageUrl={user?.profileImageUrl}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="font-medium">
                    {user?.fullName || "Unknown member"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email || "No email available"}
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="mt-1">
                    <Badge variant="outline">{member.role}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Membership</dt>
                  <dd className="mt-1">
                    <Badge variant="outline">{member.status}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">User status</dt>
                  <dd className="mt-1">{user?.status ?? "Unknown"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email verification</dt>
                  <dd className="mt-1">
                    {user?.emailVerified ? "Verified" : "Not verified"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Joined</dt>
                  <dd className="mt-1">
                    {member.createdAt
                      ? new Date(member.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Updated</dt>
                  <dd className="mt-1">
                    {member.updatedAt
                      ? new Date(member.updatedAt).toLocaleDateString()
                      : "Unknown"}
                  </dd>
                </div>
              </dl>
            </div>
          )}
          <DialogFooter>
            {member && canEdit && (
              <>
                <Button variant="outline" onClick={() => setRoleOpen(true)}>
                  Change role
                </Button>
                <Button variant="outline" onClick={() => setStatusOpen(true)}>
                  Change status
                </Button>
              </>
            )}
            {member && canRemoveMembers && member.role !== "ADMIN" && (
              <Button variant="destructive" onClick={() => setRemoveOpen(true)}>
                Remove
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <MemberRoleDialog
        open={roleOpen}
        onOpenChange={setRoleOpen}
        member={member}
        onUpdated={changed}
      />
      <MemberStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        member={member}
        onUpdated={changed}
      />
      <RemoveMemberDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        member={member}
        onRemoved={() => {
          onOpenChange(false);
          onMemberChanged?.();
        }}
      />
    </>
  );
}
