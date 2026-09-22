"use server";

import { revalidatePath } from "next/cache";
import {
  actionFailure,
  actionSuccess,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";

export type Comment = {
  id: string;
  taskId: string;
  authorId?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  author?: {
    id?: string;
    fullName?: string;
    email?: string;
    profileImageUrl?: string | null;
  };
  [key: string]: unknown;
};

export type CommentListParams = {
  page?: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
};

function refresh() {
  for (const path of [
    "/dashboard/tasks",
    "/dashboard/admin/tasks",
    "/dashboard/manager/tasks",
    "/dashboard/member/tasks",
  ])
    revalidatePath(path);
}

export async function getCommentsByTask(
  taskId: string,
  params: CommentListParams = {},
) {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 50),
    sortBy: "createdAt",
    sortOrder: params.sortOrder ?? "desc",
  });
  const result = await backendRequest<unknown>(
    `/comments/tasks/${taskId}?${query}`,
  );
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to fetch comments."),
      [] as Comment[],
    );
  const payload = unwrapPayload(result.payload);
  const source =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const items = Array.isArray(source.items)
    ? source.items
    : Array.isArray(source.comments)
      ? source.comments
      : Array.isArray(payload)
        ? payload
        : [];
  return actionSuccess(items as Comment[]);
}

export async function createComment(
  taskId: string,
  input: { content: string },
) {
  const result = await backendRequest<Comment>(`/comments/tasks/${taskId}`, {
    method: "POST",
    body: input,
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to add comment."),
      null,
    );
  refresh();
  return actionSuccess(
    unwrapPayload<Comment>(result.payload),
    "Comment added.",
  );
}

export async function updateComment(
  commentId: string,
  input: { content: string },
) {
  const result = await backendRequest<Comment>(`/comments/${commentId}`, {
    method: "PATCH",
    body: input,
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to update comment."),
      null,
    );
  refresh();
  return actionSuccess(
    unwrapPayload<Comment>(result.payload),
    "Comment updated.",
  );
}

export async function deleteComment(commentId: string) {
  const result = await backendRequest<null>(`/comments/${commentId}`, {
    method: "DELETE",
  });
  if (!result.ok)
    return actionFailure(
      backendMessage(result.payload, "Unable to delete comment."),
      null,
    );
  refresh();
  return actionSuccess(null, "Comment deleted.");
}

export const getTaskComments = getCommentsByTask;
export const addComment = async (taskId: string, content: string) =>
  createComment(taskId, { content });
