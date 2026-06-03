"use client";

import { Layers, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ContentDetailHero } from "../../../../components/ContentDetailHero";
import { PageShell } from "../../../../components/PageShell";
import { WatchDetailBody, WatchSeriesTheater } from "../../../../components/WatchPageSection";
import { TrailerEmbed } from "../../../../components/TrailerEmbed";
import { WatchAccessPanel } from "../../../../components/WatchAccessPanel";
import { WatchDiscoveryRails } from "../../../../components/WatchDiscoveryRails";

// Lazy-loaded: pulls in hls.js, which we don't want in the initial bundle.
const WatchPlayer = dynamic(
  () => import("../../../../components/WatchPlayer").then((m) => m.WatchPlayer),
  { ssr: false },
);
import { WatchSeriesEpisodeSidebar } from "../../../../components/WatchSeriesEpisodeSidebar";
import { getSeries, listEpisodes } from "@/lib/api/series";
import { listMySubscriptions } from "@/lib/api/subscriptions";
import { getPlaybackUrl } from "@/lib/api/playback";
import { isLoggedIn } from "@/lib/api/client";
import type { SeriesRead, SeasonRead } from "@/lib/api/types";
import { SAMPLE_HLS_SRC, SAMPLE_FALLBACK_SRC, SAMPLE_VIDEO_ATTRIBUTION } from "@/lib/sample-video-sources";
import { youtubeEmbedUrl } from "@/lib/youtube";

export default function WatchSeriesPlaybackPage() {
  const params = useParams<{ seriesSlug: string; playback?: string[] }>();
  const router = useRouter();

  const seriesSlug = params.seriesSlug;
  const playback = params.playback ?? [];

  const seasonNum = playback[0] ? parseInt(playback[0], 10) : 1;
  const episodeNum = playback[1] ? parseInt(playback[1], 10) : 1;

  const [series, setSeries] = useState<SeriesRead | null>(null);
  const [seasons, setSeasons] = useState<SeasonRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);

  useEffect(() => {
    if (playback.length === 0) {
      router.replace(`/watch/series/${seriesSlug}/1/1`);
      return;
    }

    const subsPromise = isLoggedIn() ? listMySubscriptions().catch(() => []) : Promise.resolve([]);

    Promise.all([getSeries(seriesSlug), listEpisodes(seriesSlug), subsPromise])
      .then(([s, seasonList, subs]) => {
        setSeries(s);
        setSeasons(seasonList);
        setHasSubscription(subs.some((sub) => sub.status === "active"));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [seriesSlug, playback.length, router]);

  // Resolve a tokenized playback URL for the active episode once entitlement is
  // known. The server re-checks access (403 if not), so this is just a hint.
  useEffect(() => {
    const season = seasons.find((s) => s.season_number === seasonNum);
    const ep = season?.episodes.find((e) => e.episode_number === episodeNum);
    const entitled = Boolean(ep && (ep.is_free === true || hasSubscription));
    const loggedIn = isLoggedIn();
    if (!ep || !entitled || !loggedIn) {
      setPlaybackUrl(null);
      return;
    }
    let cancelled = false;
    getPlaybackUrl(
      ep.id,
      `/watch/series/${seriesSlug}/${seasonNum}/${episodeNum}`,
    )
      .then((url) => !cancelled && setPlaybackUrl(url))
      .catch(() => !cancelled && setPlaybackUrl(null));
    return () => {
      cancelled = true;
    };
  }, [seasons, seasonNum, episodeNum, hasSubscription, seriesSlug]);

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

  const activeSeason = seasons.find((s) => s.season_number === seasonNum);
  const episode = activeSeason?.episodes.find((e) => e.episode_number === episodeNum);

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

  const isFree = episode.is_free === true;
  const canPlay = isLoggedIn() && (isFree || hasSubscription);
  const loginNext = `/watch/series/${seriesSlug}/${seasonNum}/${episodeNum}`;
  const payHref = `/pay/subscription?slug=${series.slug}&title=${encodeURIComponent(series.title)}&season=${seasonNum}&episode=${episodeNum}`;
  const trailerEmbed = youtubeEmbedUrl(series.trailer_url);

  const hlsSrc = playbackUrl ?? SAMPLE_HLS_SRC;
  const fallbackSrc = SAMPLE_FALLBACK_SRC;
  const attribution = playbackUrl ? undefined : SAMPLE_VIDEO_ATTRIBUTION;
  const playerTitle = `${series.title}: S${seasonNum} · ${episode.title}`;

  const detailActions = canPlay ? (
    <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/80 px-3 py-2 text-[12px] font-semibold text-text backdrop-blur-sm">
      <PlayCircle size={14} className="text-brand" aria-hidden />
      S{seasonNum} E{episodeNum} · {episode.title}
    </span>
  ) : (
    <>
      <Link
        href={
          isLoggedIn() ? payHref : `/login?next=${encodeURIComponent(loginNext)}`
        }
        className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
      >
        <PlayCircle size={16} className="fill-white text-brand" aria-hidden />
        {isLoggedIn() ? "Subscribe" : "Sign in"}
      </Link>
      {!isLoggedIn() ? (
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
              <WatchPlayer
                key={`${seriesSlug}-${seasonNum}-${episodeNum}`}
                contentId={episode.id}
                hlsSrc={hlsSrc}
                fallbackSrc={fallbackSrc}
                title={playerTitle}
                attribution={attribution}
              />
            ) : (
              <WatchAccessPanel
                title={episode.title}
                posterKey={episode.poster_key ?? series.poster_key}
                message={
                  isLoggedIn()
                    ? "Subscribe to Reeltime to watch this series."
                    : "Sign in or subscribe to watch episodes."
                }
                primaryHref={
                  isLoggedIn() ? payHref : `/login?next=${encodeURIComponent(loginNext)}`
                }
                primaryLabel={isLoggedIn() ? "Subscribe" : "Sign in"}
                secondaryHref={isLoggedIn() ? undefined : payHref}
                secondaryLabel={isLoggedIn() ? undefined : "View plans"}
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
        {!canPlay && trailerEmbed ? <TrailerEmbed embedUrl={trailerEmbed} title={series.title} /> : null}

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
          {isLoggedIn() ? (
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
