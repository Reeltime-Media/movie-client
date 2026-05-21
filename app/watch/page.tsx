"use client";

import { Clock, Film, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PageShell } from "../components/PageShell";
import { WatchDiscoveryRails } from "../components/WatchDiscoveryRails";
import { WatchPlayer } from "../components/WatchPlayer";
import { getMovie } from "@/lib/api/movies";
import { listPurchases } from "@/lib/api/purchases";
import { mediaUrl, isLoggedIn } from "@/lib/api/client";
import type { ContentRead, PurchaseRead } from "@/lib/api/types";
import { SAMPLE_HLS_SRC, SAMPLE_FALLBACK_SRC, SAMPLE_VIDEO_ATTRIBUTION } from "@/lib/sample-video-sources";

function WatchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "";

  const [movie, setMovie] = useState<ContentRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!slug) { router.replace("/movies"); return; }

    if (!isLoggedIn()) {
      router.replace(`/login?next=${encodeURIComponent(`/watch?slug=${slug}`)}`);
      return;
    }

    Promise.all([getMovie(slug), listPurchases()])
      .then(([m, purchases]: [ContentRead, PurchaseRead[]]) => {
        setMovie(m);

        const isFree = !m.price_usd || parseFloat(m.price_usd) === 0;
        const owned = purchases.some((p) => p.content_id === m.id);

        if (isFree || owned) {
          setAllowed(true);
        } else {
          router.replace(
            `/pay/movie?slug=${m.slug}&title=${encodeURIComponent(m.title)}`
          );
        }
      })
      .catch(() => router.replace("/movies"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  if (loading) {
    return (
      <PageShell wide>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      </PageShell>
    );
  }

  if (!allowed || !movie) return null;

  const title = movie.title;
  const hlsSrc = mediaUrl(movie.hls_master_key) ?? SAMPLE_HLS_SRC;
  const fallbackSrc = SAMPLE_FALLBACK_SRC;
  const attribution = movie.hls_master_key ? undefined : SAMPLE_VIDEO_ATTRIBUTION;

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
          hlsSrc={hlsSrc}
          fallbackSrc={fallbackSrc}
          title={title}
          attribution={attribution}
        />

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium text-text-muted">
          <span className="inline-flex items-center gap-1.5 text-text">
            <Film size={14} className="text-text-muted" aria-hidden />
            Feature
          </span>
          {movie.release_year && (
            <>
              <span className="select-none text-border-hover" aria-hidden>·</span>
              <span>{movie.release_year}</span>
            </>
          )}
          {movie.runtime && (
            <>
              <span className="select-none text-border-hover" aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} aria-hidden />
                {movie.runtime}
              </span>
            </>
          )}
          {movie.rating && (
            <>
              <span className="select-none text-border-hover" aria-hidden>·</span>
              <span className="inline-flex items-center gap-1 text-warning">
                <Star size={14} className="fill-current" aria-hidden />
                {movie.rating}
              </span>
            </>
          )}
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

        {movie.description && (
          <p className="mt-4 max-w-[62ch] text-[13px] leading-relaxed text-text-muted">
            {movie.description}
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

export default function WatchPage() {
  return (
    <Suspense fallback={
      <PageShell wide>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      </PageShell>
    }>
      <WatchPageInner />
    </Suspense>
  );
}
