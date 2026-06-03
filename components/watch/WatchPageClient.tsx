"use client";

import { Clock, Film, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MovieComments } from "@/components/comments/MovieComments";
import { PageShell } from "@/components/layout/PageShell";
import { TrailerEmbed } from "@/components/shared/TrailerEmbed";
import { ContentDetailHero } from "@/components/watch/ContentDetailHero";
import { WatchDiscoveryRails } from "@/components/watch/WatchDiscoveryRails";
import { WatchDetailBody, WatchMovieTheater } from "@/components/watch/WatchPageSection";
import { useMovieWatch } from "@/hooks/watch/use-movie-watch";
import { SAMPLE_HLS_SRC, SAMPLE_FALLBACK_SRC, SAMPLE_VIDEO_ATTRIBUTION } from "@/lib/sample-video-sources";
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

export function WatchPageClient({ slug, initialMovie = null }: WatchPageClientProps) {
  const {
    movie,
    loading,
    notFound,
    canPlay,
    playbackUrl,
    loggedIn,
    isFree,
    priceLabel,
    loginNext,
    payHref,
  } = useMovieWatch(slug, { initialMovie });

  if (loading) {
    return (
      <PageShell fullWidth>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      </PageShell>
    );
  }

  if (notFound || !movie) {
    return (
      <PageShell fullWidth>
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <p className="text-[15px] font-semibold text-text">Movie not found</p>
          <Link href="/movies" className="text-[13px] font-semibold text-brand hover:underline">
            Browse movies
          </Link>
        </div>
      </PageShell>
    );
  }

  const title = movie.title;
  const hlsSrc = playbackUrl ?? SAMPLE_HLS_SRC;
  const fallbackSrc = SAMPLE_FALLBACK_SRC;
  const attribution = playbackUrl ? undefined : SAMPLE_VIDEO_ATTRIBUTION;
  const trailerEmbed = youtubeEmbedUrl(movie.trailer_url);

  const detailActions = canPlay ? (
    <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/80 px-3 py-2 text-[12px] font-semibold text-text backdrop-blur-sm">
      <PlayCircle size={14} className="text-brand" aria-hidden />
      Ready to play
    </span>
  ) : (
    <>
      <Link
        href={loggedIn ? payHref : `/login?next=${encodeURIComponent(loginNext)}`}
        className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
      >
        <PlayCircle size={16} className="fill-white text-brand" aria-hidden />
        {loggedIn ? (priceLabel ? `Buy · ${priceLabel}` : "Buy to watch") : "Sign in"}
      </Link>
      {!loggedIn ? (
        <Link
          href={payHref}
          className="inline-flex items-center rounded-md border border-border bg-surface/80 px-5 py-2.5 text-[13px] font-semibold text-text backdrop-blur-sm transition-colors hover:border-border-hover"
        >
          {priceLabel ? `Buy · ${priceLabel}` : "Buy to watch"}
        </Link>
      ) : null}
    </>
  );

  return (
    <PageShell fullWidth>
      <ContentDetailHero
        posterKey={movie.poster_key}
        kicker={
          <span className="inline-flex items-center gap-2">
            <PlayCircle size={14} /> {canPlay ? "NOW PLAYING" : "MOVIE"}
          </span>
        }
        title={title}
        description={movie.description}
        actions={detailActions}
      />

      {canPlay ? (
        <WatchMovieTheater>
          <WatchPlayer
            key={hlsSrc}
            contentId={movie.id}
            hlsSrc={hlsSrc}
            fallbackSrc={fallbackSrc}
            title={title}
            attribution={attribution}
          />
        </WatchMovieTheater>
      ) : null}

      <section className="border-b border-border pb-8 pt-6">
        <WatchDetailBody>
          {!canPlay && trailerEmbed ? <TrailerEmbed embedUrl={trailerEmbed} title={title} /> : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium text-text-muted">
            <span className="inline-flex items-center gap-1.5 text-text">
              <Film size={14} className="text-text-muted" aria-hidden />
              Feature
            </span>
            {movie.release_year && (
              <>
                <span className="select-none text-border-hover" aria-hidden>
                  ·
                </span>
                <span>{movie.release_year}</span>
              </>
            )}
            {movie.runtime && (
              <>
                <span className="select-none text-border-hover" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} aria-hidden />
                  {movie.runtime}
                </span>
              </>
            )}
            {movie.rating && (
              <>
                <span className="select-none text-border-hover" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1 text-warning">
                  <Star size={14} className="fill-current" aria-hidden />
                  {movie.rating}
                </span>
              </>
            )}
            {!isFree && priceLabel && !canPlay ? (
              <>
                <span className="select-none text-border-hover" aria-hidden>
                  ·
                </span>
                <span>{priceLabel}</span>
              </>
            ) : null}
          </div>

          {movie.genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-text-muted"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {loggedIn ? <MovieComments contentId={movie.id} movieTitle={title} /> : null}

          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5 pb-0">
            <Link
              href="/movies"
              className="rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover"
            >
              Movies
            </Link>
            <Link
              href="/series"
              className="rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover"
            >
              Series
            </Link>
            {loggedIn ? (
              <Link
                href="/my-library"
                className="rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover"
              >
                My library
              </Link>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(loginNext)}`}
                className="rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover"
              >
                Sign in
              </Link>
            )}
          </div>
        </WatchDetailBody>
      </section>

      <WatchDiscoveryRails />
    </PageShell>
  );
}
