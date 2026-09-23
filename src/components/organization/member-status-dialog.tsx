"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type OrganizationMember,
  type OrganizationMembershipStatus,
  updateOrganizationMemberStatus,
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

const descriptions: Record<OrganizationMembershipStatus, string> = {
  ACTIVE: "Member can access organization resources.",
  INACTIVE: "Member temporarily has no active organization participation.",
  SUSPENDED: "Member is restricted from organization access.",
};
export function MemberStatusDialog({
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
  const [status, setStatus] = useState<OrganizationMembershipStatus>("ACTIVE");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (member) setStatus(member.status);
  }, [member]);
  async function save() {
    if (!member || member.status === status) return;
    setSaving(true);
    const result = await updateOrganizationMemberStatus(member.id, status);
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
          <DialogTitle>Change membership status</DialogTitle>
          <DialogDescription>{descriptions[status]}</DialogDescription>
        </DialogHeader>
        <Select
          value={status}
          onValueChange={(value) =>
            setStatus(value as OrganizationMembershipStatus)
          }
          disabled={saving}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void save()}
            disabled={saving || !member || member.status === status}
          >
            {saving ? "Saving..." : "Save status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
