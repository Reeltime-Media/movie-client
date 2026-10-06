"use client";

import { Calendar, ChevronRight, Clock, Loader2, Lock, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { LazyWhenVisible } from "@/components/shared/LazyWhenVisible";
import { CdnImage } from "@/components/ui/CdnImage";
import { useI18n } from "@/components/providers/LocaleProvider";
import { posterThumbUrl, posterUrl } from "@/lib/api/core";
import { SeriesUnlockBakongCheckoutModal } from "@/components/pay/SeriesUnlockBakongCheckoutModal";
import { FavouriteButton } from "@/components/watch/FavouriteButton";
import { WatchDiscoveryRails } from "@/components/watch/WatchDiscoveryRails";
import { WatchDetailBody } from "@/components/watch/WatchPageSection";
import { WatchSeriesEpisodes } from "@/components/watch/WatchSeriesEpisodes";
import { useSeriesWatch } from "@/hooks/watch/use-series-watch";
import { primaryGenre } from "@/lib/catalog-filter";
import type { SeasonRead, SeriesRead } from "@/lib/api/types";
import { formatUsdAmount } from "@/lib/pricing-tiers";

const importWatchPlayer = () => import("@/components/watch/WatchPlayer");

const WatchPlayerSkeleton = dynamic(
  () => importWatchPlayer().then((m) => m.WatchPlayerSkeleton),
  { ssr: false },
);

const WatchPlayer = dynamic(
  () => importWatchPlayer().then((m) => m.WatchPlayer),
  {
    ssr: false,
    loading: () => <WatchPlayerSkeleton fill />,
  },
);

const MovieComments = dynamic(
  () => import("@/components/comments/MovieComments").then((m) => m.MovieComments),
  { ssr: false },
);

type WatchSeriesClientProps = {
  seriesSlug: string;
  playback: string[];
  initialSeries?: SeriesRead | null;
  initialSeasons?: SeasonRead[];
};

function SeriesPlayerShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border bg-black">
      {children}
    </div>
  );
}

export function WatchSeriesClient({
  seriesSlug,
  playback,
  initialSeries = null,
  initialSeasons = [],
}: WatchSeriesClientProps) {
  const { t } = useI18n();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const {
    series,
    seasons,
    loading,
    notFound,
    playbackUrl,
    playbackLoading,
    playbackError,
    resumeTime,
    seasonNum,
    episodeNum,
    activeSeason,
    episode,
    canPlay,
    playerTitle,
    hasSubscription,
    isAdmin,
    prefetchEpisode,
    retryPlayback,
    lastWatchedEpisodeId,
    episodeWatchProgress,
    refreshSeriesWatchProgress,
    applyLocalWatchProgress,
    loggedIn,
  } = useSeriesWatch({ seriesSlug, playback, initialSeries, initialSeasons });

  const handleProgressSaved = useCallback(
    (payload: { contentId: string; positionSeconds: number; completed: boolean }) => {
      applyLocalWatchProgress(payload);
      refreshSeriesWatchProgress();
    },
    [applyLocalWatchProgress, refreshSeriesWatchProgress],
  );

  useEffect(() => {
    void importWatchPlayer();
  }, []);

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

  const genre = primaryGenre(series.genres);

  const episodeSidebar = seasons.length > 0 ? (
    <WatchSeriesEpisodes
      seriesSlug={series.slug}
      seriesTitle={series.title}
      seasons={seasons}
      activeSeason={activeSeason?.season_number ?? seasonNum}
      activeEpisode={episodeNum}
      hasSubscription={hasSubscription}
      isAdmin={isAdmin}
      onEpisodeHover={prefetchEpisode}
      lastWatchedEpisodeId={lastWatchedEpisodeId}
      episodeWatchProgress={episodeWatchProgress}
      loggedIn={loggedIn}
      className="w-full lg:w-[280px] xl:w-[300px] lg:shrink-0"
    />
  ) : null;

  if (!activeSeason || !episode) {
    return (
      <PageShell fullWidth>
        <section className="border-b border-border py-6">
          <WatchDetailBody>
            <div className="mx-auto max-w-6xl">
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
                <p className="text-[15px] font-semibold text-text">Episode not found</p>
                <Link
                  href={`/watch/series/${seriesSlug}/1/1`}
                  className="text-[13px] font-semibold text-brand hover:underline"
                >
                  Go to episode 1
                </Link>
              </div>
              {episodeSidebar}
            </div>
          </WatchDetailBody>
        </section>
      </PageShell>
    );
  }

  const breadcrumbEpisode = t("watchBreadcrumbEpisode").replace("{n}", String(episodeNum));

  let playerContent: ReactNode;
  if (canPlay) {
    if (playbackError) {
      playerContent = (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="text-[14px] font-semibold text-white/90">{t("playbackLoadError")}</p>
          <button
            type="button"
            onClick={retryPlayback}
            className="cursor-pointer rounded-md bg-brand px-4 py-2 text-[13px] font-bold text-white hover:bg-brand-hover"
          >
            {t("playbackRetry")}
          </button>
        </div>
      );
    } else if (playbackLoading || !playbackUrl) {
      playerContent = (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-white/60" aria-hidden />
          <span className="sr-only">Loading stream</span>
        </div>
      );
    } else {
      playerContent = (
        <WatchPlayer
          key={playbackUrl}
          contentId={episode.id}
          hlsSrc={playbackUrl}
          title={playerTitle}
          initialTime={resumeTime ?? 0}
          onProgressSaved={handleProgressSaved}
          fill
        />
      );
    }
  } else {
    playerContent = (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 px-6 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80">
          <Lock size={20} aria-hidden />
        </div>
        <p className="text-[14px] font-bold text-white">{t("tvSubscribeTitle")}</p>
        <button
          type="button"
          onClick={() => setCheckoutOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white hover:bg-brand-hover"
        >
          <PlayCircle size={16} className="fill-white text-brand" aria-hidden />
          Buy · ${formatUsdAmount(series.unlock_price_usd) || "2.50"}
        </button>
      </div>
    );
  }

  return (
    <PageShell fullWidth>
      <section className="border-b border-border py-4 md:py-6">
        <WatchDetailBody>
          <div className="mx-auto max-w-6xl">
            <nav
              aria-label="Breadcrumb"
              className="mb-4 flex flex-wrap items-center gap-1 text-[12px] font-medium text-text-muted"
            >
              <Link href="/" className="transition-colors hover:text-text">
                {t("navHome")}
              </Link>
              <ChevronRight size={12} className="shrink-0 text-text-disabled" aria-hidden />
              <Link href="/series" className="transition-colors hover:text-text">
                {series.title}
              </Link>
              <ChevronRight size={12} className="shrink-0 text-text-disabled" aria-hidden />
              <span className="max-w-[40ch] truncate text-text-muted">{episode.title}</span>
              <ChevronRight size={12} className="shrink-0 text-text-disabled" aria-hidden />
              <span className="text-text">{breadcrumbEpisode}</span>
            </nav>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <SeriesPlayerShell>{playerContent}</SeriesPlayerShell>

                <div id="details" className="mt-5 flex items-start gap-5 sm:gap-6">
                  {series.poster_key ? (
                    <div
                      className="relative aspect-2/3 w-[120px] shrink-0 overflow-hidden rounded-md border border-border sm:w-[140px] md:w-[160px]"
                      style={{ viewTransitionName: `poster-${series.id}` }}
                    >
                      <CdnImage
                        src={posterThumbUrl(series.poster_key, 400, series.updated_at) ?? ""}
                        fallbackSrc={posterUrl(series.poster_key, series.updated_at)}
                        alt={series.title}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-text md:text-[26px]">
                          {series.title}
                        </h1>
                        <p className="mt-1 text-[13px] font-semibold text-text-muted">
                          S{seasonNum} E{episodeNum} · {episode.title}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {!canPlay ? (
                          <button
                            type="button"
                            onClick={() => setCheckoutOpen(true)}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
                          >
                            <PlayCircle size={16} className="fill-white text-brand" aria-hidden />
                            Buy · ${formatUsdAmount(series.unlock_price_usd) || "2.50"}
                          </button>
                        ) : null}
                        <FavouriteButton contentId={series.id} />
                      </div>
                    </div>

                    {genre ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-black">
                          {genre}
                        </span>
                      </div>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-medium text-text-muted">
                      {series.release_year ? (
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={13} className="text-text-disabled" aria-hidden />
                          {series.release_year}
                        </span>
                      ) : null}
                      {episode.runtime ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={13} className="text-text-disabled" aria-hidden />
                          {episode.runtime}
                        </span>
                      ) : null}
                      {series.rating ? (
                        <span className="inline-flex items-center gap-1 text-warning">
                          <Star size={13} className="fill-current" aria-hidden />
                          {series.rating}
                        </span>
                      ) : null}
                    </div>

                    {series.description ? (
                      <p className="mt-4 max-w-3xl text-[13px] leading-relaxed text-text-muted">
                        {series.description}
                      </p>
                    ) : null}

                    {episode.description ? (
                      <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-text-muted">
                        {episode.description}
                      </p>
                    ) : null}

                    <div className="mt-5 grid max-w-md grid-cols-[110px_1fr] gap-y-2 border-t border-border pt-4 text-[13px] sm:grid-cols-[130px_1fr]">
                      {genre ? (
                        <>
                          <span className="text-text-muted">{t("watchDetailsGenre")}</span>
                          <span className="text-text">{genre}</span>
                        </>
                      ) : null}
                      {series.release_year ? (
                        <>
                          <span className="text-text-muted">{t("watchDetailsReleaseDate")}</span>
                          <span className="text-text">{series.release_year}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {episodeSidebar}
            </div>
          </div>
        </WatchDetailBody>
      </section>

      <WatchDiscoveryRails
        seriesSlug={series.slug}
        genres={genre ? [genre] : []}
        seriesPicksLayout="grid"
      />

      <section className="border-b border-border py-8 md:py-10">
        <WatchDetailBody>
          <div className="mx-auto max-w-6xl">
            <LazyWhenVisible>
              <MovieComments contentId={episode.id} movieTitle={series.title} />
            </LazyWhenVisible>
          </div>
        </WatchDetailBody>
      </section>

      {checkoutOpen ? (
        <SeriesUnlockBakongCheckoutModal
          seriesSlug={series.slug}
          title={series.title}
          watchHref={`/watch/series/${series.slug}/${seasonNum}/${episodeNum}`}
          onClose={() => setCheckoutOpen(false)}
        />
      ) : null}
    </PageShell>
  );
}
