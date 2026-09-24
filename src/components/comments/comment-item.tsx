"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deleteComment, type Comment } from "@/actions/comment.action";

import { CommentForm } from "@/components/comments/comment-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CommentItemProps = {
  comment: Comment;
  canEdit: boolean;
  canDelete: boolean;
  onChanged: () => void;
};

function getInitials(name?: string | null) {
  if (!name?.trim()) {
    return "U";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatCommentDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function CommentItem({
  comment,
  canEdit,
  canDelete,
  onChanged,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const authorName = comment.author?.fullName ?? "Unknown user";

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);

    try {
      const result = await deleteComment(comment.id);

      if (!result.success) {
        toast.error(result.message ?? "Unable to delete comment.");
        return;
      }

      toast.success("Comment deleted.");
      onChanged();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Unable to delete comment.");
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="rounded-xl border bg-muted/20 p-4">
        <CommentForm
          taskId={comment.taskId}
          comment={comment}
          onSuccess={() => {
            setEditing(false);
            onChanged();
          }}
          onCancel={() => {
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <article className="group flex gap-3">
      <Avatar className="size-9 shrink-0">
        <AvatarFallback>{getInitials(comment.author?.fullName)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 rounded-xl border bg-card p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{authorName}</p>

            <p className="text-xs text-muted-foreground">
              <time dateTime={comment.createdAt}>
                {formatCommentDate(comment.createdAt)}
              </time>

              {comment.updatedAt !== comment.createdAt && (
                <span> · edited</span>
              )}
            </p>
          </div>

          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    disabled={deleting}
                    aria-label="Comment actions"
                  />
                }
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => setEditing(true)}>
                    <Pencil className="size-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                )}

                {canDelete && (
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={deleting}
                    onClick={() => void handleDelete()}
                  >
                    <Trash2 className="size-4" />
                    <span>{deleting ? "Deleting..." : "Delete"}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
          {comment.content}
        </p>
      </div>
    </article>
  );
}
