"use client";
import { useState } from "react";
import { toast } from "sonner";
import { deleteMyAccount } from "@/actions/user.action";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  async function confirm() {
    setSaving(true);
    const result = await deleteMyAccount();
    setSaving(false);
    if (!result.success)
      toast.error(result.message ?? "Unable to delete account.");
    else {
      toast.success(result.message ?? "Account deleted.");
      setOpen(false);
    }
  }
  return (
    <>
      <button
        type="button"
        className="text-xs text-destructive underline-offset-4 hover:underline"
        onClick={() => setOpen(true)}
        disabled={saving}
      >
        Delete my account
      </button>
      <DeleteConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onCancel={() => setOpen(false)}
        onConfirm={() => void confirm()}
        title="Delete account"
        description="This permanently removes your account and cannot be undone."
      />
    </>
  );
}
