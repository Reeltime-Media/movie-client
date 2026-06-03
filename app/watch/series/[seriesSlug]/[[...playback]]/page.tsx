"use client";

import { Layers, Loader2, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { PageShell } from "@/components/layout/PageShell";
import { TrailerEmbed } from "@/components/shared/TrailerEmbed";
import { ContentDetailHero } from "@/components/watch/ContentDetailHero";
import { WatchAccessPanel } from "@/components/watch/WatchAccessPanel";
import { WatchDiscoveryRails } from "@/components/watch/WatchDiscoveryRails";
import { WatchDetailBody, WatchSeriesTheater } from "@/components/watch/WatchPageSection";
import { WatchSeriesEpisodeSidebar } from "@/components/watch/WatchSeriesEpisodeSidebar";
import { useSeriesWatch } from "@/hooks/watch/use-series-watch";
import { SAMPLE_HLS_SRC, SAMPLE_FALLBACK_SRC, SAMPLE_VIDEO_ATTRIBUTION } from "@/lib/sample-video-sources";
import { youtubeEmbedUrl } from "@/lib/youtube";

// Lazy-loaded: pulls in hls.js, which we don't want in the initial bundle.
const WatchPlayer = dynamic(
  () => import("@/components/watch/WatchPlayer").then((m) => m.WatchPlayer),
  { ssr: false },
);

export default function WatchSeriesPlaybackPage() {
  const params = useParams<{ seriesSlug: string; playback?: string[] }>();
  const seriesSlug = params.seriesSlug;
  const playback = params.playback ?? [];

  const {
    series,
    seasons,
    loading,
    notFound,
    playbackUrl,
    playbackLoading,
    loggedIn,
    seasonNum,
    episodeNum,
    activeSeason,
    episode,
    loginNext,
    payHref,
    canPlay,
    playerTitle,
  } = useSeriesWatch({ seriesSlug, playback });

  if (loading) {
    return (
      <PageShell fullWidth>
        <div className="flex h-64 items-center justify-center text-[13px] text-text-muted">
          Loading…
        </div>
      </PageShell>
    );
  }

  if (notFound || !series) {
    return (
      <PageShell fullWidth>
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <p className="text-[15px] font-semibold text-text">Series not found</p>
          <Link href="/series" className="text-[13px] text-brand hover:underline">
            Browse series
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!activeSeason || !episode) {
    return (
      <PageShell fullWidth>
        <ContentDetailHero
          posterKey={series.poster_key}
          title={series.title}
          description={series.description}
        />
        <section className="border-b border-border">
          <WatchDetailBody>
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
              <p className="text-[15px] font-semibold text-text">Episode not found</p>
              <Link
                href={`/watch/series/${seriesSlug}/1/1`}
                className="text-[13px] font-semibold text-brand hover:underline"
              >
                Go to episode 1
              </Link>
            </div>
            {seasons.length > 0 ? (
              <div className="mt-6 max-w-md">
                <WatchSeriesEpisodeSidebar
                  seriesSlug={series.slug}
                  seriesTitle={series.title}
                  seasons={seasons}
                  activeSeason={1}
                  activeEpisode={1}
                />
              </div>
            ) : null}
          </WatchDetailBody>
        </section>
      </PageShell>
    );
  }

  const trailerEmbed = youtubeEmbedUrl(series.trailer_url);
  const hlsSrc = playbackUrl ?? SAMPLE_HLS_SRC;
  const fallbackSrc = SAMPLE_FALLBACK_SRC;
  const attribution = playbackUrl ? undefined : SAMPLE_VIDEO_ATTRIBUTION;

  const detailActions = canPlay ? (
    <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/80 px-3 py-2 text-[12px] font-semibold text-text backdrop-blur-sm">
      <PlayCircle size={14} className="text-brand" aria-hidden />
      S{seasonNum} E{episodeNum} · {episode.title}
    </span>
  ) : (
    <>
      <Link
        href={loggedIn ? payHref : `/login?next=${encodeURIComponent(loginNext)}`}
        className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
      >
        <PlayCircle size={16} className="fill-white text-brand" aria-hidden />
        {loggedIn ? "Subscribe" : "Sign in"}
      </Link>
      {!loggedIn ? (
        <Link
          href={payHref}
          className="inline-flex items-center rounded-md border border-border bg-surface/80 px-5 py-2.5 text-[13px] font-semibold text-text backdrop-blur-sm transition-colors hover:border-border-hover"
        >
          View plans
        </Link>
      ) : null}
    </>
  );

  return (
    <PageShell fullWidth>
      <ContentDetailHero
        posterKey={episode.poster_key ?? series.poster_key}
        kicker={
          <span className="inline-flex items-center gap-2">
            <Layers size={14} /> SERIES · S{seasonNum} · E{episodeNum}
          </span>
        }
        title={series.title}
        description={series.description}
        actions={detailActions}
      />

      <section className="pb-8">
        <WatchSeriesTheater
          media={
            canPlay ? (
              playbackLoading ? (
                <div className="flex aspect-video w-full items-center justify-center rounded-md bg-black">
                  <Loader2 size={36} className="animate-spin text-white/60" aria-hidden />
                  <span className="sr-only">Loading stream</span>
                </div>
              ) : (
                <WatchPlayer
                  key={`${seriesSlug}-${seasonNum}-${episodeNum}-${hlsSrc}`}
                  contentId={episode.id}
                  hlsSrc={hlsSrc}
                  fallbackSrc={fallbackSrc}
                  title={playerTitle}
                  attribution={attribution}
                />
              )
            ) : (
              <WatchAccessPanel
                title={episode.title}
                posterKey={episode.poster_key ?? series.poster_key}
                message={
                  loggedIn
                    ? "Subscribe to Reeltime to watch this series."
                    : "Sign in or subscribe to watch episodes."
                }
                primaryHref={
                  loggedIn ? payHref : `/login?next=${encodeURIComponent(loginNext)}`
                }
                primaryLabel={loggedIn ? "Subscribe" : "Sign in"}
                secondaryHref={loggedIn ? undefined : payHref}
                secondaryLabel={loggedIn ? undefined : "View plans"}
              />
            )
          }
          sidebar={
            <WatchSeriesEpisodeSidebar
              seriesSlug={series.slug}
              seriesTitle={series.title}
              seasons={seasons}
              activeSeason={seasonNum}
              activeEpisode={episodeNum}
            />
          }
        />

        <WatchDetailBody>
          {!canPlay && trailerEmbed ? (
            <TrailerEmbed embedUrl={trailerEmbed} title={series.title} />
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium text-text-muted">
            <span className="inline-flex items-center gap-1.5 text-text">
              <PlayCircle size={14} className="text-text-muted" aria-hidden />
              S{seasonNum} E{episodeNum}
            </span>
            <span className="font-semibold text-text">{episode.title}</span>
            {episode.runtime && (
              <>
                <span className="select-none text-border-hover" aria-hidden>
                  ·
                </span>
                <span>{episode.runtime}</span>
              </>
            )}
            {series.release_year && (
              <>
                <span className="select-none text-border-hover" aria-hidden>
                  ·
                </span>
                <span>{series.release_year}</span>
              </>
            )}
            {series.rating && (
              <>
                <span className="select-none text-border-hover" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1 text-warning">
                  <Star size={14} className="fill-current" aria-hidden />
                  {series.rating}
                </span>
              </>
            )}
          </div>

          {series.genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {series.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-text-muted"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {episode.description ? (
            <p className="mt-4 text-[13px] leading-relaxed text-text-muted">
              {episode.description}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
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
