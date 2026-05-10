import { Layers, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { PageHeader } from "../../../../components/PageHeader";
import { PageShell } from "../../../../components/PageShell";
import { WatchDiscoveryRails } from "../../../../components/WatchDiscoveryRails";
import { WatchPlayer } from "../../../../components/WatchPlayer";
import { WatchSeriesEpisodeSidebar } from "../../../../components/WatchSeriesEpisodeSidebar";
import {
  SAMPLE_FALLBACK_SRC,
  SAMPLE_HLS_SRC,
  SAMPLE_VIDEO_ATTRIBUTION,
} from "../../../../lib/sampleVideoSources";
import { getSeason, getWatchSeries } from "../../../../lib/watchSeriesCatalog";

type Params = { seriesSlug: string; playback?: string[] };

export default async function WatchSeriesPlaybackPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { seriesSlug, playback } = await params;
  const series = getWatchSeries(seriesSlug);
  if (!series) notFound();

  const parts = playback ?? [];

  if (parts.length === 0) {
    permanentRedirect(`/watch/series/${seriesSlug}/1/1`);
  }

  if (parts.length === 1) {
    const only = parts[0];
    if (!/^\d+$/.test(only)) notFound();
    permanentRedirect(`/watch/series/${seriesSlug}/1/${only}`);
  }

  if (parts.length !== 2) notFound();

  const seasonNum = Number.parseInt(parts[0]!, 10);
  const episodeNum = Number.parseInt(parts[1]!, 10);

  if (!Number.isFinite(seasonNum) || !Number.isFinite(episodeNum)) {
    notFound();
  }

  const seasonData = getSeason(series, seasonNum);
  if (
    !seasonData ||
    episodeNum < 1 ||
    episodeNum > seasonData.episodes.length
  ) {
    notFound();
  }

  const episode = seasonData.episodes[episodeNum - 1]!;
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
        description={`${episode.title} · Season ${seasonNum}, Episode ${episodeNum} of ${seasonData.episodes.length}`}
      />

      <section className="border-b border-border px-6 pb-8 md:px-8">
        <div className="flex flex-col gap-6 lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_min(280px,30vw)] lg:items-stretch lg:gap-6">
          <div className="min-w-0">
            <WatchPlayer
              key={`${seriesSlug}-${seasonNum}-${episodeNum}`}
              hlsSrc={SAMPLE_HLS_SRC}
              fallbackSrc={SAMPLE_FALLBACK_SRC}
              title={playerTitle}
              attribution={SAMPLE_VIDEO_ATTRIBUTION}
            />
          </div>
          <WatchSeriesEpisodeSidebar
            seriesSlug={series.slug}
            seasons={series.seasons}
            activeSeason={seasonNum}
            activeEpisode={episodeNum}
            episodes={seasonData.episodes}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium text-text-muted">
          <span className="inline-flex items-center gap-1.5 text-text">
            <PlayCircle size={14} className="text-text-muted" aria-hidden />
            S{seasonNum} E{episodeNum}
          </span>
          <span className="select-none text-border-hover" aria-hidden>
            ·
          </span>
          <span>{episode.duration}</span>
          <span className="select-none text-border-hover" aria-hidden>
            ·
          </span>
          <span>{series.year}</span>
          <span className="select-none text-border-hover" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1 text-warning">
            <Star size={14} className="fill-current" aria-hidden />
            {series.rating}
          </span>
          <span className="select-none text-border-hover" aria-hidden>
            ·
          </span>
          <span className="rounded-sm border border-border bg-surface px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            {series.maturity}
          </span>
        </div>

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

        <p className="mt-4 max-w-[62ch] text-[13px] leading-relaxed text-text-muted">
          <span className="font-semibold text-text">{episode.title}</span>
          {" · "}
          {series.synopsis}
        </p>

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
          <Link
            href="/my-library"
            className="rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover"
          >
            My library
          </Link>
        </div>
      </section>

      <WatchDiscoveryRails />
    </PageShell>
  );
}
