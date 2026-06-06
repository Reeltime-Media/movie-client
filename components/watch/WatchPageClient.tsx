"use client";

import { CheckCircle2, ChevronRight, Clock, Film, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { FavoriteButton } from "@/components/catalog/FavoriteButton";
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

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="shrink-0 text-[12px] font-medium text-text-muted">{label}</dt>
      <dd className="text-right text-[12px] font-semibold text-text">{children}</dd>
    </div>
  );
}

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
  const hlsSrc = playbackUrl ?? SAMPLE_HLS_SRC;
  const fallbackSrc = SAMPLE_FALLBACK_SRC;
  const attribution = playbackUrl ? undefined : SAMPLE_VIDEO_ATTRIBUTION;
  const trailerEmbed = youtubeEmbedUrl(movie.trailer_url);

  const detailActions = (
    <>
      {canPlay ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-2 text-[12px] font-semibold text-success">
          <CheckCircle2 size={14} aria-hidden />
          Ready to watch
        </span>
      ) : (
        <>
          <Link
            href={loggedIn ? payHref : `/login?next=${encodeURIComponent(loginNext)}`}
            className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
          >
            <PlayCircle size={16} className="fill-white text-brand" aria-hidden />
            {loggedIn ? (priceLabel ? `Buy · ${priceLabel}` : "Buy to watch") : "Sign in to watch"}
          </Link>
          {!loggedIn ? (
            <Link
              href={payHref}
              className="inline-flex items-center rounded-md border border-border bg-surface/80 px-5 py-2.5 text-[13px] font-semibold text-text backdrop-blur-sm transition-colors hover:border-border-hover"
            >
              {priceLabel ? `Buy · ${priceLabel}` : "View purchase"}
            </Link>
          ) : null}
        </>
      )}
      <FavoriteButton contentId={movie.id} variant="inline" />
    </>
  );

  return (
    <PageShell fullWidth>
      <ContentDetailHero
        posterKey={movie.poster_key}
        kicker={
          <span className="inline-flex items-center gap-2 uppercase">
            <Film size={13} aria-hidden />
            {canPlay ? "Now playing" : "Feature film"}
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

      <section className="border-b border-border py-8 md:py-10">
        <WatchDetailBody>
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
            <div className="min-w-0">
              {!canPlay && trailerEmbed ? (
                <TrailerEmbed embedUrl={trailerEmbed} title={title} />
              ) : null}

              <div className={!canPlay && trailerEmbed ? "mt-8" : ""}>
                <MovieComments contentId={movie.id} movieTitle={title} />
              </div>
            </div>

            <aside className="h-fit rounded-lg border border-border bg-surface p-5 lg:sticky lg:top-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                Details
              </h2>

              <dl className="mt-4">
                <DetailRow label="Type">Feature film</DetailRow>
                {movie.release_year ? <DetailRow label="Year">{movie.release_year}</DetailRow> : null}
                {movie.runtime ? (
                  <DetailRow label="Runtime">
                    <span className="inline-flex items-center justify-end gap-1">
                      <Clock size={13} className="text-text-muted" aria-hidden />
                      {movie.runtime}
                    </span>
                  </DetailRow>
                ) : null}
                {movie.rating ? (
                  <DetailRow label="Rating">
                    <span className="inline-flex items-center justify-end gap-1 text-warning">
                      <Star size={13} className="fill-current" aria-hidden />
                      {movie.rating}
                    </span>
                  </DetailRow>
                ) : null}
                {!isFree && priceLabel ? (
                  <DetailRow label="Price">{priceLabel}</DetailRow>
                ) : isFree ? (
                  <DetailRow label="Access">Free</DetailRow>
                ) : null}
              </dl>

              {movie.genres.length > 0 ? (
                <div className="mt-4 border-t border-border pt-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                    Genres
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {movie.genres.map((g) => (
                      <span
                        key={g}
                        className="rounded-md border border-border bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-text-muted"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>

          <nav
            aria-label="Breadcrumb"
            className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center gap-1 border-t border-border pt-6 text-[12px] text-text-muted"
          >
            <Link href="/movies" className="font-medium transition-colors hover:text-text">
              Movies
            </Link>
            <ChevronRight size={14} className="text-border-hover" aria-hidden />
            <span className="truncate font-semibold text-text">{title}</span>
            {loggedIn ? (
              <>
                <span className="mx-1 text-border-hover" aria-hidden>
                  ·
                </span>
                <Link href="/my-library" className="font-medium transition-colors hover:text-text">
                  My library
                </Link>
              </>
            ) : null}
          </nav>
        </WatchDetailBody>
      </section>

      <WatchDiscoveryRails />
    </PageShell>
  );
}
