"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  type OrganizationMember,
  removeOrganizationMember,
} from "@/actions/organization.action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function RemoveMemberDialog({
  open,
  onOpenChange,
  member,
  onRemoved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrganizationMember | null;
  onRemoved?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  async function remove() {
    if (!member) return;
    setSaving(true);
    const result = await removeOrganizationMember(member.id);
    setSaving(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    onOpenChange(false);
    onRemoved?.();
  }
  const name = member?.user?.fullName || member?.user?.email || "this member";
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member?</AlertDialogTitle>
          <AlertDialogDescription>
            Remove {name} from this organization? They will lose access to its
            resources.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => void remove()}
            disabled={saving}
          >
            {saving ? "Removing..." : "Remove member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
