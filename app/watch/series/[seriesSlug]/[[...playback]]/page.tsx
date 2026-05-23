"use client";

import { Layers, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "../../../../components/PageHeader";
import { PageShell } from "../../../../components/PageShell";
import { WatchDiscoveryRails } from "../../../../components/WatchDiscoveryRails";
import { WatchPlayer } from "../../../../components/WatchPlayer";
import { WatchSeriesEpisodeSidebar } from "../../../../components/WatchSeriesEpisodeSidebar";
import { getSeries, listEpisodes } from "@/lib/api/series";
import { listMySubscriptions } from "@/lib/api/subscriptions";
import { mediaUrl, isLoggedIn } from "@/lib/api/client";
import type { SeriesRead, SeasonRead } from "@/lib/api/types";
import { SAMPLE_HLS_SRC, SAMPLE_FALLBACK_SRC, SAMPLE_VIDEO_ATTRIBUTION } from "@/lib/sample-video-sources";

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

  useEffect(() => {
    if (playback.length === 0) {
      router.replace(`/watch/series/${seriesSlug}/1/1`);
      return;
    }

    if (!isLoggedIn()) {
      const next = `/watch/series/${seriesSlug}/${seasonNum}/${episodeNum}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    Promise.all([
      getSeries(seriesSlug),
      listEpisodes(seriesSlug),
      listMySubscriptions().catch(() => []),
    ])
      .then(([s, seasonList, subs]) => {
        setSeries(s);
        setSeasons(seasonList);
        setHasSubscription(subs.some((sub) => sub.status === "active"));
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [seriesSlug]);

  if (loading) {
    return (
      <PageShell wide>
        <div className="flex h-64 items-center justify-center text-[13px] text-text-muted">
          Loading…
        </div>
      </PageShell>
    );
  }

  if (notFound || !series) {
    return (
      <PageShell wide>
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
      <PageShell wide>
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <p className="text-[15px] font-semibold text-text">Episode not found</p>
          <Link
            href={`/watch/series/${seriesSlug}/1/1`}
            className="text-[13px] text-brand hover:underline"
          >
            Go to episode 1
          </Link>
        </div>
      </PageShell>
    );
  }

  const isFree = episode.is_free === true;
  if (!isFree && !hasSubscription) {
    router.replace(
      `/pay/subscription?slug=${series.slug}&title=${encodeURIComponent(series.title)}&season=${seasonNum}&episode=${episodeNum}`,
    );
    return null;
  }

  const hlsSrc = mediaUrl(episode.hls_master_key) ?? SAMPLE_HLS_SRC;
  const fallbackSrc = SAMPLE_FALLBACK_SRC;
  const attribution = episode.hls_master_key ? undefined : SAMPLE_VIDEO_ATTRIBUTION;
  const playerTitle = `${series.title}: S${seasonNum} · ${episode.title}`;

  return (
    <PageShell wide>
      <PageHeader
        kicker={
          <span className="inline-flex items-center gap-2">
            <Layers size={14} /> SERIES · S{seasonNum} · E{episodeNum}
          </span>
        }
        title={series.title}
        description={`${episode.title} · Season ${seasonNum}, Episode ${episodeNum} of ${activeSeason.episodes.length}`}
      />

      <section className="border-b border-border px-6 pb-8 md:px-8">
        <div className="flex flex-col gap-6 lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_min(280px,30vw)] lg:items-stretch lg:gap-6">
          <div className="min-w-0">
            <WatchPlayer
              key={`${seriesSlug}-${seasonNum}-${episodeNum}`}
              contentId={episode.id}
              hlsSrc={hlsSrc}
              fallbackSrc={fallbackSrc}
              title={playerTitle}
              attribution={attribution}
            />
          </div>
          <WatchSeriesEpisodeSidebar
            seriesSlug={series.slug}
            seriesTitle={series.title}
            seasons={seasons}
            activeSeason={seasonNum}
            activeEpisode={episodeNum}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium text-text-muted">
          <span className="inline-flex items-center gap-1.5 text-text">
            <PlayCircle size={14} className="text-text-muted" aria-hidden />
            S{seasonNum} E{episodeNum}
          </span>
          {episode.runtime && (
            <>
              <span className="select-none text-border-hover" aria-hidden>·</span>
              <span>{episode.runtime}</span>
            </>
          )}
          {series.release_year && (
            <>
              <span className="select-none text-border-hover" aria-hidden>·</span>
              <span>{series.release_year}</span>
            </>
          )}
          {series.rating && (
            <>
              <span className="select-none text-border-hover" aria-hidden>·</span>
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

        {series.description && (
          <p className="mt-4 max-w-[62ch] text-[13px] leading-relaxed text-text-muted">
            <span className="font-semibold text-text">{episode.title}</span>
            {" · "}
            {series.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
          <Link href="/movies" className="rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover">
            Movies
          </Link>
          <Link href="/series" className="rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover">
            Series
          </Link>
          <Link href="/my-library" className="rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover">
            My library
          </Link>
        </div>
      </section>

      <WatchDiscoveryRails />
    </PageShell>
  );
}
