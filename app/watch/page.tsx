import { Clock, Film, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "../components/PageHeader";
import { PageShell } from "../components/PageShell";
import { WatchDiscoveryRails } from "../components/WatchDiscoveryRails";
import { WatchPlayer } from "../components/WatchPlayer";
import {
  SAMPLE_FALLBACK_SRC,
  SAMPLE_HLS_SRC,
  SAMPLE_VIDEO_ATTRIBUTION,
} from "../lib/sampleVideoSources";

const GENRES = ["Thriller", "Action", "Neo-noir"] as const;

function decodeTitle(raw: string) {
  try {
    return decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    return raw;
  }
}

type SearchParams = { title?: string };

export default async function WatchPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const title = decodeTitle(sp.title ?? "Watch");

  return (
    <PageShell wide>
      <PageHeader
        kicker={
          <span className="inline-flex items-center gap-2">
            <PlayCircle size={14} /> NOW PLAYING
          </span>
        }
        title={title}
      />

      <section className="border-b border-border px-6 pb-8 md:px-8">
        <WatchPlayer
          hlsSrc={SAMPLE_HLS_SRC}
          fallbackSrc={SAMPLE_FALLBACK_SRC}
          title={title}
          attribution={SAMPLE_VIDEO_ATTRIBUTION}
        />

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium text-text-muted">
          <span className="inline-flex items-center gap-1.5 text-text">
            <Film size={14} className="text-text-muted" aria-hidden />
            Feature
          </span>
          <span className="select-none text-border-hover" aria-hidden>
            ·
          </span>
          <span>2026</span>
          <span className="select-none text-border-hover" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} aria-hidden />
            2h 14m
          </span>
          <span className="select-none text-border-hover" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1 text-warning">
            <Star size={14} className="fill-current" aria-hidden />
            8.4
          </span>
          <span className="select-none text-border-hover" aria-hidden>
            ·
          </span>
          <span className="rounded-sm border border-border bg-surface px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            PG-13
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <span
              key={g}
              className="rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-text-muted"
            >
              {g}
            </span>
          ))}
        </div>

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
