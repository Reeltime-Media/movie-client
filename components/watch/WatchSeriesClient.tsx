"use client";

import { Calendar, Check, Clock, Loader2, PlayCircle, Plus, Star } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { LazyWhenVisible } from "@/components/shared/LazyWhenVisible";
import { useFavorites } from "@/components/providers/FavoritesProvider";
import { useI18n } from "@/components/providers/LocaleProvider";
import { CdnImage } from "@/components/ui/CdnImage";
import { WatchDiscoveryRails } from "@/components/watch/WatchDiscoveryRails";
import { WatchDetailBody, WatchPlayerBand } from "@/components/watch/WatchPageSection";
import { WatchSeriesEpisodes } from "@/components/watch/WatchSeriesEpisodes";
import { useSeriesWatch } from "@/hooks/watch/use-series-watch";
import { posterThumbUrl } from "@/lib/api/core";
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

const MovieComments = dynamic(
  () => import("@/components/comments/MovieComments").then((m) => m.MovieComments),
  { ssr: false },
);

function FavouriteButton({ contentId }: { contentId: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useI18n();
  const active = isFavorite(contentId);

  return (
    <button
      type="button"
      onClick={() => void toggleFavorite(contentId)}
      className={[
        "inline-flex shrink-0 items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-bold transition-colors",
        active
          ? "border border-border bg-surface-elevated text-text hover:border-border-hover"
          : "bg-brand text-white hover:bg-brand-hover",
      ].join(" ")}
    >
      {active ? (
        <Check size={15} aria-hidden />
      ) : (
        <Plus size={15} aria-hidden />
      )}
      {active ? t("favoriteRemove") : t("favoriteAdd")}
    </button>
  );
}

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
  const { t } = useI18n();
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
              <div className="mt-6 max-w-2xl">
                <WatchSeriesEpisodes
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

  return (
    <PageShell fullWidth>
      {canPlay ? (
        playbackLoading || !playbackUrl ? (
          <WatchPlayerBand>
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <Loader2 size={36} className="animate-spin text-white/60" aria-hidden />
              <span className="sr-only">Loading stream</span>
            </div>
          </WatchPlayerBand>
        ) : (
          <WatchPlayerBand>
            <WatchPlayer
              key={playbackUrl}
              contentId={episode.id}
              hlsSrc={playbackUrl}
              title={playerTitle}
              initialTime={resumeTime ?? 0}
              fill
            />
          </WatchPlayerBand>
        )
      ) : null}

      <section className="border-b border-border py-6 md:py-8">
        <WatchDetailBody>
          <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:gap-6">
            {series.poster_key ? (
              <div
                className="relative aspect-2/3 w-[140px] shrink-0 overflow-hidden rounded-md border border-border sm:w-[160px]"
                style={{ viewTransitionName: `poster-${series.id}` }}
              >
                <CdnImage
                  src={posterThumbUrl(series.poster_key, 320) ?? ""}
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
                <div className="flex flex-wrap items-center gap-2">
                  {!canPlay ? (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          loggedIn
                            ? payHref
                            : `/login?next=${encodeURIComponent(loginNext)}`,
                        )
                      }
                      className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
                    >
                      <PlayCircle size={16} className="fill-white text-brand" aria-hidden />
                      {loggedIn ? "Subscribe to watch" : "Sign in to watch"}
                    </button>
                  ) : null}
                  <FavouriteButton contentId={series.id} />
                </div>
              </div>

              {series.genres.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {series.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-black"
                    >
                      {g}
                    </span>
                  ))}
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
                {series.genres.length > 0 ? (
                  <>
                    <span className="text-text-muted">{t("watchDetailsGenre")}</span>
                    <span className="text-text">{series.genres.join(", ")}</span>
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
        </WatchDetailBody>
      </section>

      <section className="border-b border-border py-6 md:py-8">
        <WatchDetailBody>
          <div className="mx-auto max-w-6xl">
            <WatchSeriesEpisodes
              seriesSlug={series.slug}
              seriesTitle={series.title}
              seasons={seasons}
              activeSeason={seasonNum}
              activeEpisode={episodeNum}
              hasSubscription={hasSubscription}
              onEpisodeHover={prefetchEpisode}
            />
          </div>
        </WatchDetailBody>
      </section>

      <WatchDiscoveryRails
        seriesSlug={series.slug}
        genres={series.genres}
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
    </PageShell>
  );
}
