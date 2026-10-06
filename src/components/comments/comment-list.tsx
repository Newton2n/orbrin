"use client";

import { MessageSquare, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { type Comment } from "@/actions/comment.action";
import { useComments } from "@/hooks/use-bff-queries";

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
  const queryClient = useQueryClient();
  const query = useComments(taskId, {
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "asc",
  });
  const comments = query.data?.comments ?? [];
  const loading = query.isLoading;
  const error = query.error instanceof Error ? query.error.message : null;
  const refresh = () => void query.refetch();
  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["comments", taskId] });

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
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
          <span className="sr-only">Refresh comments</span>
        </Button>
      </div>

      {canComment && (
        <>
          <CommentForm taskId={taskId} onSuccess={invalidate} />

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
            onClick={refresh}
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
                onChanged={invalidate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
