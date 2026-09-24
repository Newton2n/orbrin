"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty.")
    .max(2000, "Comment must be less than 2000 characters."),
});

type CommentFormValues = z.infer<typeof commentSchema>;

export function CommentForm({
  taskId,
  comment,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const [saving, setSaving] = useState(false);

  const editing = Boolean(comment);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: comment?.content ?? "",
    },
  });

  useEffect(() => {
    reset({
      content: comment?.content ?? "",
    });
  }, [comment, reset]);

  async function onSubmit(values: CommentFormValues) {
    setSaving(true);

    try {
      const content = values.content.trim();

      const result =
        editing && comment
          ? await updateComment({
              commentId: comment.id,
              content,
            })
          : await createComment(taskId, {
              content,
            });

      if (!result.success) {
        toast.error(
          result.message ?? "Unable to save comment.",
        );
        return;
      }

      toast.success(
        editing
          ? "Comment updated successfully."
          : "Comment added successfully.",
      );

      reset({
        content: "",
      });

      onSuccess();
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3"
    >
      <div className="space-y-1.5">
        <Textarea
          {...register("content")}
          placeholder="Write a comment..."
          rows={3}
          disabled={saving}
          aria-invalid={Boolean(errors.content)}
        />

        {errors.content && (
          <p className="text-sm text-destructive">
            {errors.content.message}
          </p>
        )}
      </div>

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

        <Button type="submit" disabled={saving}>
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