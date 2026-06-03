"use client";

import { Clock, Film, PlayCircle, Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { ContentDetailHero } from "../components/ContentDetailHero";
import { PageShell } from "../components/PageShell";
import { WatchDetailBody, WatchMovieTheater } from "../components/WatchPageSection";
import { MovieComments } from "../components/MovieComments";
import { TrailerEmbed } from "../components/TrailerEmbed";
import { WatchDiscoveryRails } from "../components/WatchDiscoveryRails";

// Lazy-loaded: pulls in hls.js, which we don't want in the initial bundle.
const WatchPlayer = dynamic(
  () => import("../components/WatchPlayer").then((m) => m.WatchPlayer),
  { ssr: false },
);
import { getMovie } from "@/lib/api/movies";
import { listPurchases } from "@/lib/api/purchases";
import { getPlaybackUrl } from "@/lib/api/playback";
import { isLoggedIn } from "@/lib/api/client";
import type { ContentRead, PurchaseRead } from "@/lib/api/types";
import { SAMPLE_HLS_SRC, SAMPLE_FALLBACK_SRC, SAMPLE_VIDEO_ATTRIBUTION } from "@/lib/sample-video-sources";
import { youtubeEmbedUrl } from "@/lib/youtube";

function WatchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "";

  const [movie, setMovie] = useState<ContentRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [canPlay, setCanPlay] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      router.replace("/movies");
      return;
    }

    const purchasesPromise = isLoggedIn() ? listPurchases().catch(() => []) : Promise.resolve([]);

    Promise.all([getMovie(slug), purchasesPromise])
      .then(([m, purchases]: [ContentRead, PurchaseRead[]]) => {
        setMovie(m);
        const isFree = !m.price_usd || parseFloat(m.price_usd) === 0;
        const owned = purchases.some((p) => p.content_id === m.id);
        const loggedIn = isLoggedIn();
        const entitled = isFree || owned;
        setCanPlay(loggedIn && entitled);
        if (loggedIn && entitled) {
          getPlaybackUrl(m.id, `/watch?slug=${encodeURIComponent(m.slug)}`)
            .then(setPlaybackUrl)
            .catch(() => setPlaybackUrl(null));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, router]);

  if (loading) {
    return (
      <PageShell fullWidth>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      </PageShell>
    );
  }

  if (notFound || !movie) {
    return (
      <PageShell fullWidth>
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <p className="text-[15px] font-semibold text-text">Movie not found</p>
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
  const isFree = !movie.price_usd || parseFloat(movie.price_usd) === 0;
  const priceLabel = movie.price_usd ? `$${parseFloat(movie.price_usd).toFixed(2)}` : null;
  const loginNext = `/watch?slug=${encodeURIComponent(movie.slug)}`;
  const payHref = `/pay/movie?slug=${movie.slug}&title=${encodeURIComponent(movie.title)}`;

  const detailActions = canPlay ? (
    <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/80 px-3 py-2 text-[12px] font-semibold text-text backdrop-blur-sm">
      <PlayCircle size={14} className="text-brand" aria-hidden />
      Ready to play
    </span>
  ) : (
    <>
      <Link
        href={isLoggedIn() ? payHref : `/login?next=${encodeURIComponent(loginNext)}`}
        className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
      >
        <PlayCircle size={16} className="fill-white text-brand" aria-hidden />
        {isLoggedIn() ? (priceLabel ? `Buy · ${priceLabel}` : "Buy to watch") : "Sign in"}
      </Link>
      {!isLoggedIn() ? (
        <Link
          href={payHref}
          className="inline-flex items-center rounded-md border border-border bg-surface/80 px-5 py-2.5 text-[13px] font-semibold text-text backdrop-blur-sm transition-colors hover:border-border-hover"
        >
          {priceLabel ? `Buy · ${priceLabel}` : "Buy to watch"}
        </Link>
      ) : null}
    </>
  );

  return (
    <PageShell fullWidth>
      <ContentDetailHero
        posterKey={movie.poster_key}
        kicker={
          <span className="inline-flex items-center gap-2">
            <PlayCircle size={14} /> {canPlay ? "NOW PLAYING" : "MOVIE"}
          </span>
        }
        title={title}
        description={movie.description}
        actions={detailActions}
      />

      {canPlay ? (
        <WatchMovieTheater>
          <WatchPlayer
            contentId={movie.id}
            hlsSrc={hlsSrc}
            fallbackSrc={fallbackSrc}
            title={title}
            attribution={attribution}
          />
        </WatchMovieTheater>
      ) : null}

      <section className="border-b border-border pb-8 pt-6">
        <WatchDetailBody>
          {!canPlay && trailerEmbed ? <TrailerEmbed embedUrl={trailerEmbed} title={title} /> : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium text-text-muted">
            <span className="inline-flex items-center gap-1.5 text-text">
              <Film size={14} className="text-text-muted" aria-hidden />
              Feature
            </span>
            {movie.release_year && (
              <>
                <span className="select-none text-border-hover" aria-hidden>
                  ·
                </span>
                <span>{movie.release_year}</span>
              </>
            )}
            {movie.runtime && (
              <>
                <span className="select-none text-border-hover" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} aria-hidden />
                  {movie.runtime}
                </span>
              </>
            )}
            {movie.rating && (
              <>
                <span className="select-none text-border-hover" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1 text-warning">
                  <Star size={14} className="fill-current" aria-hidden />
                  {movie.rating}
                </span>
              </>
            )}
            {!isFree && priceLabel && !canPlay ? (
              <>
                <span className="select-none text-border-hover" aria-hidden>
                  ·
                </span>
                <span>{priceLabel}</span>
              </>
            ) : null}
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

          {isLoggedIn() ? <MovieComments contentId={movie.id} movieTitle={title} /> : null}

          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5 pb-0">
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

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <PageShell fullWidth>
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
          </div>
        </PageShell>
      }
    >
      <WatchPageInner />
    </Suspense>
  );
}
