"use client";

import { Loader2, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { WatchDiscoveryRails } from "@/components/watch/WatchDiscoveryRails";
import { WatchDetailBody, WatchSeriesTheater } from "@/components/watch/WatchPageSection";
import { WatchSeriesEpisodeSidebar } from "@/components/watch/WatchSeriesEpisodeSidebar";
import { useSeriesWatch } from "@/hooks/watch/use-series-watch";
import type { SeasonRead, SeriesRead } from "@/lib/api/types";

// Lazy-loaded: pulls in hls.js, which we don't want in the initial bundle.
const WatchPlayerSkeleton = dynamic(
  () => import("@/components/watch/WatchPlayer").then((m) => m.WatchPlayerSkeleton),
  { ssr: false },
);

const WatchPlayer = dynamic(
  () => import("@/components/watch/WatchPlayer").then((m) => m.WatchPlayer),
  {
    ssr: false,
    loading: () => <WatchPlayerSkeleton fill />,
  },
);

type WatchSeriesClientProps = {
  seriesSlug: string;
  playback: string[];
  /** Catalog data seeded from the Server Component (skips the client fetch). */
  initialSeries?: SeriesRead | null;
  initialSeasons?: SeasonRead[];
};

export function WatchSeriesClient({
  seriesSlug,
  playback,
  initialSeries = null,
  initialSeasons = [],
}: WatchSeriesClientProps) {
  const router = useRouter();
  const {
    series,
    seasons,
    loading,
    notFound,
    playbackUrl,
    playbackLoading,
    resumeTime,
    loggedIn,
    seasonNum,
    episodeNum,
    activeSeason,
    episode,
    loginNext,
    payHref,
    canPlay,
    playerTitle,
    hasSubscription,
    prefetchEpisode,
  } = useSeriesWatch({ seriesSlug, playback, initialSeries, initialSeasons });

  useEffect(() => {
    if (loading || notFound || !series || !activeSeason || !episode) return;
    if (canPlay) return;
    // Guests must sign in first; subscribed unlock goes through pricing.
    if (!loggedIn) {
      router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
      return;
    }
    router.replace(payHref);
  }, [
    loading,
    notFound,
    series,
    activeSeason,
    episode,
    canPlay,
    loggedIn,
    loginNext,
    payHref,
    router,
  ]);

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
                  hasSubscription={hasSubscription}
                  onEpisodeHover={prefetchEpisode}
                />
              </div>
            ) : null}
          </WatchDetailBody>
        </section>
      </PageShell>
    );
  }

  if (!canPlay) {
    return (
      <PageShell fullWidth>
        <div className="flex h-64 items-center justify-center text-[13px] text-text-muted">
          <Loader2 size={28} className="animate-spin text-text-muted" aria-hidden />
          <span className="sr-only">Redirecting to pricing</span>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell fullWidth>
      <section>
        <WatchSeriesTheater
          media={
            playbackLoading || !playbackUrl ? (
              <div className="flex h-full w-full items-center justify-center bg-black">
                <Loader2 size={36} className="animate-spin text-white/60" aria-hidden />
                <span className="sr-only">Loading stream</span>
              </div>
            ) : (
              <WatchPlayer
                key={playbackUrl}
                contentId={episode.id}
                hlsSrc={playbackUrl}
                title={playerTitle}
                initialTime={resumeTime ?? 0}
                fill
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
              hasSubscription={hasSubscription}
              onEpisodeHover={prefetchEpisode}
            />
          }
        />

        <WatchDetailBody>
          <div className="mt-6 pb-8">
            <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-text md:text-[26px]">
              {series.title}
            </h1>
            {series.description ? (
              <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-text-muted">
                {series.description}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium text-text-muted border-t border-border pt-4">
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
          </div>
        </WatchDetailBody>
      </section>

      <WatchDiscoveryRails seriesSlug={series.slug} genres={series.genres} />
    </PageShell>
  );
}
