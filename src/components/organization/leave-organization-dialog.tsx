"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { leaveOrganization } from "@/actions/organization.action";
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

export function LeaveOrganizationDialog({
  open,
  onOpenChange,
  onLeft,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeft?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  async function leave() {
    setSaving(true);
    const result = await leaveOrganization();
    setSaving(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    onOpenChange(false);
    onLeft?.();
    router.push("/login");
  }
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave organization?</AlertDialogTitle>
          <AlertDialogDescription>
            You will lose access to this organization. This action is available
            only to administrators and may be blocked if you are the last
            administrator.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => void leave()}
            disabled={saving}
          >
            {saving ? "Leaving..." : "Leave organization"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
