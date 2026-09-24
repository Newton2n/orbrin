"use client";

import { MessageSquare, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { getCommentsByTask, type Comment } from "@/actions/comment.action";

import { CommentForm } from "@/components/comments/comment-form";
import { CommentItem } from "@/components/comments/comment-item";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type CommentListProps = {
  taskId: string;
  currentUserId?: string;
  canComment: boolean;
  canEditAny: boolean;
  canDeleteAny: boolean;
};

export function CommentList({
  taskId,
  currentUserId,
  canComment,
  canEditAny,
  canDeleteAny,
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    if (!taskId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getCommentsByTask(taskId, {
        page: 1,
        limit: 50,
        sortBy: "createdAt",
        sortOrder: "asc",
      });

      if (!result.success) {
        setComments([]);
        setError(result.message ?? "Unable to load comments.");
        return;
      }

      setComments(result.data.comments);
    } catch {
      setComments([]);
      setError("Unable to load comments.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" />
            <h3 className="font-heading font-semibold">Comments</h3>

            {!loading && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {comments.length}
              </span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => void loadComments()}
          disabled={loading}
        >
          <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
          <span className="sr-only">Refresh comments</span>
        </Button>
      </div>

      {canComment && (
        <>
          <CommentForm taskId={taskId} onSuccess={() => void loadComments()} />

          <Separator />
        </>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-20 animate-pulse rounded-xl bg-muted" />
          <div className="h-20 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>

          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => void loadComments()}
          >
            Try again
          </Button>
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <MessageSquare className="mx-auto size-7 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium">No comments yet</p>

          <p className="mt-1 text-xs text-muted-foreground">
            Start the discussion on this task.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isAuthor =
              Boolean(currentUserId) && comment.authorId === currentUserId;

            return (
              <CommentItem
                key={comment.id}
                comment={comment}
                canEdit={isAuthor || canEditAny}
                canDelete={isAuthor || canDeleteAny}
                onChanged={() => void loadComments()}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
