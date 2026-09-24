"use client";

import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  createComment,
  updateComment,
  type Comment,
} from "@/actions/comment.action";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CommentFormProps = {
  taskId: string;
  comment?: Comment | null;
  onSuccess: () => void;
  onCancel?: () => void;
};

export function CommentForm({
  taskId,
  comment,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState(comment?.content ?? "");
  const [saving, setSaving] = useState(false);

  const editing = Boolean(comment);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = content.trim();

    if (!value) {
      toast.error("Comment cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      const result =
        editing && comment
          ? await updateComment({
              commentId: comment.id,
              content: value,
            })
          : await createComment(taskId, {
              content: value,
            });

      if (!result.success) {
        toast.error(result.message ?? "Unable to save comment.");
        return;
      }

      toast.success(
        editing
          ? "Comment updated successfully."
          : "Comment added successfully.",
      );

      setContent("");
      onSuccess();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write a comment..."
        rows={3}
        disabled={saving}
      />

      <div className="flex justify-end gap-2">
        {editing && onCancel ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
        ) : null}

        <Button type="submit" disabled={saving || !content.trim()}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}

          {editing ? "Update comment" : "Add comment"}
        </Button>
      </div>
    </form>
  );
}
