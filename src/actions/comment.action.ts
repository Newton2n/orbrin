"use server";

import { revalidatePath } from "next/cache";
import {
  actionFailure,
  actionSuccess,
  type ActionResult,
  backendMessage,
  backendRequest,
  unwrapPayload,
} from "../lib/server/backend-api";

export type CommentAuthor = {
  id: string;
  fullName: string;
  email: string;
};

export type Comment = {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: CommentAuthor;
};

export type CommentPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type CommentListResponse = {
  comments: Comment[];
  pagination: CommentPagination;
};

export type CommentActionResult<T> = ActionResult<T>;

export type CreateCommentInput = {
  content: string;
};

export type UpdateCommentInput = {
  commentId: string;
  content: string;
};

export type CommentQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

const commentPaths = [
  "/dashboard/admin/tasks",
  "/dashboard/manager/tasks",
  "/dashboard/member/tasks",
];

function revalidateCommentPaths() {
  for (const path of commentPaths) {
    revalidatePath(path);
  }
}

function getDefaultPagination(
  params: CommentQueryParams = {},
): CommentPagination {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

function buildCommentQuery(params: CommentQueryParams = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const queryString = query.toString();

  return queryString ? `?${queryString}` : "";
}



export async function getCommentsByTask(
  taskId: string,
  params: CommentQueryParams = {},
): Promise<CommentActionResult<CommentListResponse>> {
  if (!taskId) {
    return actionFailure("Task ID is required.", {
      comments: [],
      pagination: getDefaultPagination(params),
    });
  }

  const query = buildCommentQuery(params);

  const result = await backendRequest<unknown>(
    `/comments/tasks/${taskId}${query}`,
  );

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to fetch comments."),
      {
        comments: [],
        pagination: getDefaultPagination(params),
      },
    );
  }

  const payload = result.payload;

  if (!payload || typeof payload !== "object") {
    return actionFailure("Invalid comment response from server.", {
      comments: [],
      pagination: getDefaultPagination(params),
    });
  }

  const response = payload as {
    data?: unknown;
    pagination?: CommentPagination;
  };

  return actionSuccess({
    comments: Array.isArray(response.data) ? (response.data as Comment[]) : [],
    pagination: response.pagination ?? getDefaultPagination(params),
  });
}


export async function createComment(
  taskId: string,
  input: CreateCommentInput,
): Promise<CommentActionResult<Comment | null>> {
  if (!taskId) {
    return actionFailure("Task ID is required.", null);
  }

  if (!input.content?.trim()) {
    return actionFailure("Comment content is required.", null);
  }

  const result = await backendRequest<unknown>(`/comments/tasks/${taskId}`, {
    method: "POST",
    body: {
      content: input.content.trim(),
    },
  });

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to create comment."),
      null,
    );
  }

  revalidateCommentPaths();

  return actionSuccess(
    unwrapPayload<Comment>(result.payload),
    "Comment added successfully.",
  );
}

export async function updateComment(
  input: UpdateCommentInput,
): Promise<CommentActionResult<Comment | null>> {
  if (!input.commentId) {
    return actionFailure("Comment ID is required.", null);
  }

  if (!input.content?.trim()) {
    return actionFailure("Comment content is required.", null);
  }

  const result = await backendRequest<unknown>(`/comments/${input.commentId}`, {
    method: "PATCH",
    body: {
      content: input.content.trim(),
    },
  });

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to update comment."),
      null,
    );
  }

  revalidateCommentPaths();

  return actionSuccess(
    unwrapPayload<Comment>(result.payload),
    "Comment updated successfully.",
  );
}

export async function deleteComment(
  commentId: string,
): Promise<CommentActionResult<Comment | null>> {
  if (!commentId) {
    return actionFailure("Comment ID is required.", null);
  }

  const result = await backendRequest<unknown>(`/comments/${commentId}`, {
    method: "DELETE",
  });

  if (!result.ok) {
    return actionFailure(
      backendMessage(result.payload, "Unable to delete comment."),
      null,
    );
  }

  revalidateCommentPaths();

  return actionSuccess(
    unwrapPayload<Comment>(result.payload),
    "Comment deleted successfully.",
  );
}
