import { apiFetch } from "../core/client";

type CommentAuthorRead = {
  id: string;
  display_name: string;
};

export type CommentRead = {
  id: string;
  content_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  author: CommentAuthorRead;
  score: number;
  user_vote: number | null;
  user_reported: boolean;
};

export type CommentThreadRead = CommentRead & {
  replies: CommentThreadRead[];
};

export type PaginatedComments = {
  items: CommentThreadRead[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export const COMMENTS_PAGE_SIZE = 5;

export async function listComments(
  contentId: string,
  page = 1,
  pageSize = COMMENTS_PAGE_SIZE,
): Promise<PaginatedComments> {
  const params = new URLSearchParams({
    content_id: contentId,
    page: String(page),
    page_size: String(pageSize),
  });
  return apiFetch<PaginatedComments>(`/comments/?${params}`);
}

export async function createComment(
  contentId: string,
  body: string,
  parentId?: string | null,
): Promise<CommentRead> {
  return apiFetch<CommentRead>("/comments/", {
    method: "POST",
    body: {
      content_id: contentId,
      body,
      parent_id: parentId ?? null,
    },
  });
}

export async function reportComment(commentId: string): Promise<void> {
  await apiFetch<void>(`/comments/${commentId}/report`, { method: "POST" });
}

/** value: 1 = upvote, -1 = downvote, 0 = clear the current vote. */
export async function voteComment(commentId: string, value: 1 | -1 | 0): Promise<CommentRead> {
  return apiFetch<CommentRead>(`/comments/${commentId}/vote`, {
    method: "POST",
    body: { value },
  });
}
