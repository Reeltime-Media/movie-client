"use client";

import { MessageSquare, ThumbsDown, ThumbsUp, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  COMMENTS_PAGE_SIZE,
  createComment,
  listComments,
  reportComment,
  voteComment,
  type CommentRead,
  type CommentThreadRead,
} from "@/lib/api/comments";
import { useI18n } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/hooks/auth/use-auth";
import { loginPathWithNext } from "@/lib/auth-redirect";

function formatRelativeTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffSec = Math.round((Date.now() - date.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale === "km" ? "km" : "en", { numeric: "auto" });
  if (diffSec < 60) return rtf.format(-diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return rtf.format(-diffHr, "hour");
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return rtf.format(-diffDay, "day");
  return date.toLocaleDateString(locale === "km" ? "km-KH" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
}

function avatarHue(userId: string): number {
  let h = 0;
  for (let i = 0; i < userId.length; i += 1) {
    h = (h + userId.charCodeAt(i) * 17) % 360;
  }
  return h;
}

function toThread(comment: CommentRead): CommentThreadRead {
  return { ...comment, replies: [] };
}

function insertReply(
  roots: CommentThreadRead[],
  parentId: string,
  reply: CommentThreadRead,
): CommentThreadRead[] {
  return roots.map((node) => {
    if (node.id === parentId) {
      return { ...node, replies: [...node.replies, reply] };
    }
    if (node.replies.length > 0) {
      return { ...node, replies: insertReply(node.replies, parentId, reply) };
    }
    return node;
  });
}

function markReportedInTree(
  roots: CommentThreadRead[],
  commentId: string,
): CommentThreadRead[] {
  return roots.map((node) => {
    if (node.id === commentId) {
      return { ...node, user_reported: true };
    }
    if (node.replies.length > 0) {
      return { ...node, replies: markReportedInTree(node.replies, commentId) };
    }
    return node;
  });
}

function updateCommentInTree(
  roots: CommentThreadRead[],
  commentId: string,
  updater: (c: CommentThreadRead) => CommentThreadRead,
): CommentThreadRead[] {
  return roots.map((node) => {
    if (node.id === commentId) return updater(node);
    if (node.replies.length > 0) {
      return { ...node, replies: updateCommentInTree(node.replies, commentId, updater) };
    }
    return node;
  });
}

type MovieCommentsProps = {
  contentId: string;
  movieTitle: string;
};

export function MovieComments({ contentId, movieTitle }: MovieCommentsProps) {
  const { t, locale } = useI18n();
  const { loggedIn } = useAuth();
  const pathname = usePathname();
  const loginHref = loginPathWithNext(pathname || "/");
  const [comments, setComments] = useState<CommentThreadRead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const hasMore = page < pages;

  // Reset when switching to a different movie (adjust-state-during-render pattern).
  const [prevContentId, setPrevContentId] = useState(contentId);
  if (prevContentId !== contentId) {
    setPrevContentId(contentId);
    setComments([]);
    setTotal(0);
    setPage(1);
    setPages(1);
    setLoading(true);
    setError(null);
  }

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    setError(null);
    try {
      const res = await listComments(contentId, page + 1, COMMENTS_PAGE_SIZE);
      setComments((prev) => [...prev, ...res.items]);
      setTotal(res.total);
      setPage(res.page);
      setPages(res.pages);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : t("commentsLoadError"),
      );
    } finally {
      setLoadingMore(false);
    }
  }, [contentId, page, t]);

  useEffect(() => {
    let cancelled = false;
    listComments(contentId, 1, COMMENTS_PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setComments(res.items);
        setTotal(res.total);
        setPage(res.page);
        setPages(res.pages);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error && err.message
              ? err.message
              : t("commentsLoadError"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contentId, t]);

  async function handleTopLevelSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createComment(contentId, trimmed);
      setBody("");
      setComments((prev) => [toThread(created), ...prev]);
      setTotal((n) => n + 1);
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : t("commentsPostError"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReplySubmit(parentId: string) {
    const trimmed = replyBody.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createComment(contentId, trimmed, parentId);
      setReplyBody("");
      setReplyingTo(null);
      setComments((prev) => insertReply(prev, parentId, toThread(created)));
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : t("commentsPostError"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleReport(commentId: string) {
    void reportComment(commentId)
      .then(() => {
        setComments((prev) => markReportedInTree(prev, commentId));
      })
      .catch(() => {});
  }

  function handleVote(comment: CommentThreadRead, direction: 1 | -1) {
    if (!loggedIn) {
      window.location.href = loginHref;
      return;
    }
    const prevValue = comment.user_vote ?? 0;
    const nextValue: 1 | -1 | 0 = prevValue === direction ? 0 : direction;
    const scoreDelta = nextValue - prevValue;

    setComments((prev) =>
      updateCommentInTree(prev, comment.id, (c) => ({
        ...c,
        score: c.score + scoreDelta,
        user_vote: nextValue === 0 ? null : nextValue,
      })),
    );

    voteComment(comment.id, nextValue).catch(() => {
      setComments((prev) =>
        updateCommentInTree(prev, comment.id, (c) => ({
          ...c,
          score: c.score - scoreDelta,
          user_vote: prevValue === 0 ? null : (prevValue as 1 | -1),
        })),
      );
    });
  }

  return (
    <section
      className="mt-8"
      aria-labelledby="movie-comments-heading"
    >
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare size={18} className="text-brand" aria-hidden />
        <h2
          id="movie-comments-heading"
          className="text-[15px] font-bold tracking-[-0.02em] text-text"
        >
          {t("commentsTitle")}
        </h2>
        {total > 0 && (
          <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-text-muted">
            {total}
          </span>
        )}
      </div>
      <p className="sr-only">
        {t("commentsTitle")}: {movieTitle}
      </p>

      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        {loggedIn ? (
          <form onSubmit={handleTopLevelSubmit} className="mb-6 flex gap-3">
            <div
              className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-bg text-text-muted"
              aria-hidden
            >
              <User size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <label htmlFor="comment-body" className="sr-only">
                {t("commentsPlaceholder")}
              </label>
              <textarea
                id="comment-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t("commentsPlaceholder")}
                maxLength={2000}
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none transition-colors placeholder:text-text-disabled focus:border-border-hover"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !body.trim()}
                  className="rounded-md bg-brand px-4 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? t("commentsPosting") : t("commentsPost")}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <p className="mb-6 text-[13px] text-text-muted">
            {t("commentsSignInToPost")}{" "}
            <Link href={loginHref} className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>
        )}
        {submitError && (
          <p className="mb-4 text-[12px] text-warning" role="alert">
            {submitError}
          </p>
        )}

        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-brand" />
          </div>
        ) : error ? (
          <p className="text-[13px] text-warning" role="alert">
            {error}
          </p>
        ) : comments.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-text-muted">{t("commentsEmpty")}</p>
        ) : (
          <ul className="space-y-6">
            {comments.map((comment) => (
              <CommentThreadItem
                key={comment.id}
                comment={comment}
                depth={0}
                locale={locale}
                t={t}
                replyingTo={replyingTo}
                replyBody={replyBody}
                submitting={submitting}
                onReplyOpen={(id) => {
                  setReplyingTo(id);
                  setReplyBody("");
                  setSubmitError(null);
                }}
                onReplyCancel={() => {
                  setReplyingTo(null);
                  setReplyBody("");
                }}
                onReplyBodyChange={setReplyBody}
                onReplySubmit={handleReplySubmit}
                onReport={handleReport}
                onVote={handleVote}
              />
            ))}
          </ul>
        )}

        {!loading && !error && hasMore && (
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="mt-6 w-full rounded-md border border-border bg-bg py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover disabled:opacity-50"
          >
            {loadingMore ? t("commentsLoadingMore") : t("commentsLoadMore")}
          </button>
        )}
      </div>
    </section>
  );
}

type CommentThreadItemProps = {
  comment: CommentThreadRead;
  depth: number;
  locale: string;
  t: (key: import("@/lib/i18n").TranslationKey) => string;
  replyingTo: string | null;
  replyBody: string;
  submitting: boolean;
  onReplyOpen: (id: string) => void;
  onReplyCancel: () => void;
  onReplyBodyChange: (value: string) => void;
  onReplySubmit: (parentId: string) => void;
  onReport: (commentId: string) => void;
  onVote: (comment: CommentThreadRead, direction: 1 | -1) => void;
};

function CommentThreadItem({
  comment,
  depth,
  locale,
  t,
  replyingTo,
  replyBody,
  submitting,
  onReplyOpen,
  onReplyCancel,
  onReplyBodyChange,
  onReplySubmit,
  onReport,
  onVote,
}: CommentThreadItemProps) {
  const isReplying = replyingTo === comment.id;
  const hue = avatarHue(comment.author.id);

  return (
    <li className={depth > 0 ? "mt-4" : undefined}>
      <div className={depth > 0 ? "border-l-2 border-border pl-4 sm:pl-5" : undefined}>
        <article className="flex gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: `hsl(${hue} 42% 42%)` }}
            aria-hidden
          >
            {authorInitials(comment.author.display_name)}
          </div>

          <div className="min-w-0 flex-1">
            <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-[13px] font-bold text-text">
                {comment.author.display_name}
              </span>
              <time
                dateTime={comment.created_at}
                className="text-[12px] text-text-muted"
                title={new Date(comment.created_at).toLocaleString()}
              >
                {formatRelativeTime(comment.created_at, locale)}
              </time>
            </header>

            <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-text">
              {comment.body}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] font-semibold">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onVote(comment, 1)}
                  aria-label={t("commentsVoteUp")}
                  aria-pressed={comment.user_vote === 1}
                  className={
                    comment.user_vote === 1
                      ? "text-brand"
                      : "text-text-muted transition-colors hover:text-text"
                  }
                >
                  <ThumbsUp size={14} className={comment.user_vote === 1 ? "fill-current" : ""} aria-hidden />
                </button>
                <span className="min-w-[1.5ch] text-center text-text-muted">{comment.score}</span>
                <button
                  type="button"
                  onClick={() => onVote(comment, -1)}
                  aria-label={t("commentsVoteDown")}
                  aria-pressed={comment.user_vote === -1}
                  className={
                    comment.user_vote === -1
                      ? "text-danger"
                      : "text-text-muted transition-colors hover:text-text"
                  }
                >
                  <ThumbsDown size={14} className={comment.user_vote === -1 ? "fill-current" : ""} aria-hidden />
                </button>
              </div>

              <button
                type="button"
                onClick={() => (isReplying ? onReplyCancel() : onReplyOpen(comment.id))}
                className="text-text-muted transition-colors hover:text-text"
              >
                {t("commentsReply")}
              </button>

              <button
                type="button"
                onClick={() => onReport(comment.id)}
                disabled={comment.user_reported}
                className="text-text-muted transition-colors hover:text-text disabled:cursor-default disabled:opacity-50"
              >
                {comment.user_reported ? t("commentsReported") : t("commentsReport")}
              </button>
            </div>

            {isReplying && (
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void onReplySubmit(comment.id);
                }}
              >
                <textarea
                  value={replyBody}
                  onChange={(e) => onReplyBodyChange(e.target.value)}
                  placeholder={t("commentsReplyPlaceholder")}
                  maxLength={2000}
                  rows={2}
                  autoFocus
                  className="min-w-0 flex-1 resize-none rounded-lg border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-border-hover"
                />
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="submit"
                    disabled={submitting || !replyBody.trim()}
                    className="rounded-md bg-brand px-3 py-1.5 text-[11px] font-bold text-white hover:bg-brand-hover disabled:opacity-50"
                  >
                    {t("commentsPost")}
                  </button>
                  <button
                    type="button"
                    onClick={onReplyCancel}
                    className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-text-muted hover:text-text"
                  >
                    {t("commentsCancelReply")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </article>

        {comment.replies.length > 0 && (
          <ul className="mt-1">
            {comment.replies.map((reply) => (
              <CommentThreadItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                locale={locale}
                t={t}
                replyingTo={replyingTo}
                replyBody={replyBody}
                submitting={submitting}
                onReplyOpen={onReplyOpen}
                onReplyCancel={onReplyCancel}
                onReplyBodyChange={onReplyBodyChange}
                onReplySubmit={onReplySubmit}
                onReport={onReport}
                onVote={onVote}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
