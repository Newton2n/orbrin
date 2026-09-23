"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type OrganizationMember,
  updateOrganizationMemberRole,
} from "@/actions/organization.action";
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

export function MemberRoleDialog({
  open,
  onOpenChange,
  member,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrganizationMember | null;
  onUpdated?: () => void;
}) {
  const [role, setRole] = useState<"MANAGER" | "MEMBER">("MEMBER");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (member?.role === "MANAGER" || member?.role === "MEMBER")
      setRole(member.role);
  }, [member]);
  async function save() {
    if (!member || member.role === role) return;
    setSaving(true);
    const result = await updateOrganizationMemberRole(member.id, role);
    setSaving(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    onOpenChange(false);
    onUpdated?.();
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change member role</DialogTitle>
          <DialogDescription>
            Managers can coordinate projects, teams, sprints, and tasks. Members
            have normal collaboration access.
          </DialogDescription>
        </DialogHeader>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as "MANAGER" | "MEMBER")}
          disabled={saving}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MANAGER">Manager</SelectItem>
            <SelectItem value="MEMBER">Member</SelectItem>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void save()}
            disabled={saving || !member || member.role === role}
          >
            {saving ? "Saving..." : "Save role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
