"use client";

import { Clock, Link2, Loader2, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { CdnImage } from "@/components/ui/CdnImage";
import { posterUrl } from "@/lib/api/client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { MovieComments } from "@/components/comments/MovieComments";
import { PageShell } from "@/components/layout/PageShell";
import { TrailerEmbed } from "@/components/shared/TrailerEmbed";
import { WatchDiscoveryRails } from "@/components/watch/WatchDiscoveryRails";
import { WatchDetailBody } from "@/components/watch/WatchPageSection";
import { useMovieWatch } from "@/hooks/watch/use-movie-watch";
import type { ContentRead } from "@/lib/api/types";
import { youtubeEmbedUrl } from "@/lib/youtube";

const WatchPlayer = dynamic(
  () => import("@/components/watch/WatchPlayer").then((m) => m.WatchPlayer),
  { ssr: false },
);

type WatchPageClientProps = {
  slug: string;
  initialMovie?: ContentRead | null;
};

function ShareButton({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated transition-colors hover:bg-border"
    >
      {children}
    </a>
  );
}

export function WatchPageClient({ slug, initialMovie = null }: WatchPageClientProps) {
  const {
    movie,
    loading,
    notFound,
    canPlay,
    playbackUrl,
    playbackLoading,
    loggedIn,
    isFree,
    priceLabel,
    loginNext,
    payHref,
  } = useMovieWatch(slug, { initialMovie });

  // Keep all hooks above the early returns below so hook order stays stable
  // across the loading → loaded transition.
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  if (loading) {
    return (
      <PageShell fullWidth>
        <div className="flex h-64 items-center justify-center gap-3 text-[13px] text-text-muted">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-brand" />
          Loading…
        </div>
      </PageShell>
    );
  }

  if (notFound || !movie) {
    return (
      <PageShell fullWidth>
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <p className="text-[15px] font-semibold text-text">Movie not found</p>
          <p className="max-w-sm text-[13px] text-text-muted">
            This title may have been removed or the link is incorrect.
          </p>
          <Link href="/movies" className="text-[13px] font-semibold text-brand hover:underline">
            Browse movies
          </Link>
        </div>
      </PageShell>
    );
  }

  const title = movie.title;
  const trailerEmbed = youtubeEmbedUrl(movie.trailer_url);

  return (
    <PageShell fullWidth>
      {/* Cinematic video band — its height tracks the 16:9 player and is capped
          to the viewport on large screens. On phones the cap doesn't bind, so the
          band collapses to a tight player at the top instead of a tall box with
          empty space above and below. */}
      {canPlay || trailerEmbed ? (
        <div className="relative ml-[calc(50%-50vw)] flex w-screen max-w-none shrink-0 items-center justify-center border-b border-border px-2 py-2 sm:px-6 sm:py-6 lg:px-10">
          <div className="w-full max-w-[calc((100dvh-7rem)*16/9)]">
            {canPlay ? (
              playbackLoading || !playbackUrl ? (
                <div className="flex aspect-video w-full items-center justify-center bg-black">
                  <Loader2 size={36} className="animate-spin text-white/60" aria-hidden />
                  <span className="sr-only">Loading stream</span>
                </div>
              ) : (
                <WatchPlayer
                  key={playbackUrl}
                  contentId={movie.id}
                  hlsSrc={playbackUrl}
                  title={title}
                />
              )
            ) : (
              <TrailerEmbed embedUrl={trailerEmbed!} title={title} />
            )}
          </div>
        </div>
      ) : null}

      {/* Details below video */}
      <section id="details" className="relative border-b border-border py-6 md:py-8">
        <WatchDetailBody>
          <div className="mx-auto max-w-6xl">
            <div className="flex items-start gap-8">

              {/* Left zone — all metadata */}
              <div className="min-w-0 flex-1">

                {/* Title + buy button row */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-text md:text-[26px]">
                      {title}
                    </h1>
                    {movie.rating ? (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-text-muted">
                        <Star size={13} className="fill-warning text-warning shrink-0" aria-hidden />
                        <span className="font-medium">{movie.rating}</span>
                        {movie.release_year ? (
                          <>
                            <span className="text-border-hover">·</span>
                            <span>{movie.release_year}</span>
                          </>
                        ) : null}
                        {movie.runtime ? (
                          <>
                            <span className="text-border-hover">·</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock size={12} aria-hidden />
                              {movie.runtime}
                            </span>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {!canPlay ? (
                    <div className="pt-1">
                      <Link
                        href={loggedIn ? payHref : `/login?next=${encodeURIComponent(loginNext)}`}
                        className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
                      >
                        <PlayCircle size={16} className="fill-white text-brand" aria-hidden />
                        {loggedIn ? (priceLabel ? `Buy · ${priceLabel}` : "Buy to watch") : "Sign in to watch"}
                      </Link>
                    </div>
                  ) : null}
                </div>

                {/* Description */}
                {movie.description ? (
                  <p className="mt-4 max-w-3xl text-[13px] leading-relaxed text-text-muted">
                    {movie.description}
                  </p>
                ) : null}

                {/* Genres */}
                {movie.genres.length > 0 ? (
                  <div className="mt-5">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-disabled">
                      Genre
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {movie.genres.map((g) => (
                        <span
                          key={g}
                          className="cursor-default rounded-sm border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium text-text-muted transition-colors hover:border-border-hover hover:text-text"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Share row */}
                <div className="mt-5">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-disabled">
                    Share
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <ShareButton href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} label="Share on Facebook">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#1877F2]" aria-hidden><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                    </ShareButton>
                    <ShareButton href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`} label="Share on X">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-text" aria-hidden><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </ShareButton>
                    <ShareButton href="https://www.instagram.com" label="Share on Instagram">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                        <defs><radialGradient id="ig-grad" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs>
                        <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </ShareButton>
                    <button
                      type="button"
                      aria-label="Copy link"
                      onClick={() => navigator.clipboard?.writeText(shareUrl)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated transition-colors hover:bg-border"
                    >
                      <Link2 size={15} className="text-text-muted" aria-hidden />
                    </button>
                  </div>
                </div>

              </div>{/* end left zone */}

              {/* Right zone — poster thumbnail, desktop only */}
              {movie.poster_key && (
                <div 
                  className="relative hidden aspect-[2/3] w-[110px] shrink-0 overflow-hidden border border-border md:block"
                  style={{ viewTransitionName: `poster-${movie.id}` }}
                >
                  <CdnImage
                    src={posterUrl(movie.poster_key) ?? ""}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

            </div>{/* end two-zone flex */}
          </div>
        </WatchDetailBody>
      </section>

      {/* Comments */}
      <section className="border-b border-border py-8 md:py-10">
        <WatchDetailBody>
          <div className="mx-auto max-w-6xl">
            <MovieComments contentId={movie.id} movieTitle={title} />
          </div>
        </WatchDetailBody>
      </section>

      <WatchDiscoveryRails />
    </PageShell>
  );
}
