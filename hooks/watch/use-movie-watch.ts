"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/hooks/auth/use-auth";
import { getMovie } from "@/lib/api/movies";
import { getPlaybackUrl } from "@/lib/api/playback";
import { listPurchases } from "@/lib/api/purchases";
import type { ContentRead } from "@/lib/api/types";
import { moviePayHref, movieWatchHref } from "@/lib/movie-routes";

function isMovieFree(movie: ContentRead) {
  return !movie.price_usd || parseFloat(movie.price_usd) === 0;
}

type UseMovieWatchOptions = {
  /** When provided (e.g. from Server Component), skips the initial metadata fetch. */
  initialMovie?: ContentRead | null;
};

export function useMovieWatch(slug: string, options: UseMovieWatchOptions = {}) {
  const router = useRouter();
  const { loggedIn } = useAuth();
  const { initialMovie = null } = options;
  const seededMovieRef = useRef(
    initialMovie && initialMovie.slug === slug ? initialMovie : null,
  );

  const [movie, setMovie] = useState<ContentRead | null>(seededMovieRef.current);
  const [loading, setLoading] = useState(!seededMovieRef.current && Boolean(slug));
  const [canPlay, setCanPlay] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      router.replace("/movies");
      return;
    }

    let cancelled = false;

    async function resolveEntitlement(m: ContentRead) {
      const purchases = loggedIn ? await listPurchases().catch(() => []) : [];
      if (cancelled) return;
      const entitled = isMovieFree(m) || purchases.some((p) => p.content_id === m.id);
      setCanPlay(loggedIn && entitled);
      if (loggedIn && entitled) {
        getPlaybackUrl(m.id, `/watch?slug=${encodeURIComponent(m.slug)}`)
          .then((url) => !cancelled && setPlaybackUrl(url))
          .catch(() => !cancelled && setPlaybackUrl(null));
      } else {
        setPlaybackUrl(null);
      }
    }

    const seeded = seededMovieRef.current;
    if (seeded && seeded.slug === slug) {
      setMovie(seeded);
      setNotFound(false);
      setLoading(false);
      void resolveEntitlement(seeded);
      return () => {
        cancelled = true;
      };
    }

    setPlaybackUrl(null);
    setCanPlay(false);
    setLoading(true);

    const purchasesPromise = loggedIn ? listPurchases().catch(() => []) : Promise.resolve([]);

    Promise.all([getMovie(slug), purchasesPromise])
      .then(([m, purchases]) => {
        if (cancelled) return;
        setMovie(m);
        const entitled = isMovieFree(m) || purchases.some((p) => p.content_id === m.id);
        setCanPlay(loggedIn && entitled);
        if (loggedIn && entitled) {
          getPlaybackUrl(m.id, `/watch?slug=${encodeURIComponent(m.slug)}`)
            .then((url) => !cancelled && setPlaybackUrl(url))
            .catch(() => !cancelled && setPlaybackUrl(null));
        }
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [slug, router, loggedIn]);

  const derived = useMemo(() => {
    if (!movie) {
      return {
        isFree: false,
        priceLabel: null as string | null,
        loginNext: "",
        payHref: "",
      };
    }
    const isFree = isMovieFree(movie);
    const priceLabel = movie.price_usd
      ? `$${parseFloat(movie.price_usd).toFixed(2)}`
      : null;
    return {
      isFree,
      priceLabel,
      loginNext: movieWatchHref(movie.slug),
      payHref: moviePayHref(movie.slug, movie.title),
    };
  }, [movie]);

  return {
    movie,
    loading,
    notFound,
    canPlay,
    playbackUrl,
    loggedIn,
    ...derived,
  };
}
