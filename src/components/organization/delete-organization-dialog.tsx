"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  deleteOrganization,
  type Organization,
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

export function DeleteOrganizationDialog({
  open,
  onOpenChange,
  organization,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization | null;
  onDeleted?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  async function remove() {
    setSaving(true);
    const result = await deleteOrganization();
    setSaving(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    onOpenChange(false);
    onDeleted?.();
    router.push("/login");
  }
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete organization?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes {organization?.name ?? "the organization"},
            its membership, and associated access. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => void remove()}
            disabled={saving}
          >
            {saving ? "Deleting..." : "Delete organization"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
