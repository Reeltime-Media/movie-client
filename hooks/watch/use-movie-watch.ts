"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { getMovie } from "@/lib/api/movies";
import { getPlaybackUrl } from "@/lib/api/playback";
import { listPurchases } from "@/lib/api/purchases";
import type { ContentRead } from "@/lib/api/types";
import { isAdminUser } from "@/lib/auth/is-admin";
import { canWatchMovie, isMovieFree } from "@/lib/movie-entitlement";
import { moviePayHref, movieWatchHref } from "@/lib/movie-routes";

type UseMovieWatchOptions = {
  /** When provided (e.g. from Server Component), skips the initial metadata fetch. */
  initialMovie?: ContentRead | null;
};

export function useMovieWatch(slug: string, options: UseMovieWatchOptions = {}) {
  const router = useRouter();
  const { loggedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = isAdminUser(user);
  const { initialMovie = null } = options;
  const isSeeded = initialMovie && initialMovie.slug === slug;
  const [movie, setMovie] = useState<ContentRead | null>(isSeeded ? initialMovie : null);
  const [loading, setLoading] = useState(!isSeeded && Boolean(slug));
  const [canPlay, setCanPlay] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);
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
      const entitled =
        canWatchMovie(m, { ownedIds: new Set(purchases.map((p) => p.content_id)), isAdmin });
      setCanPlay(loggedIn && entitled);
      if (loggedIn && entitled) {
        setPlaybackLoading(true);
        try {
          const url = await getPlaybackUrl(m.id);
          if (!cancelled) setPlaybackUrl(url);
        } catch {
          if (!cancelled) setPlaybackUrl(null);
        } finally {
          if (!cancelled) setPlaybackLoading(false);
        }
      } else {
        setPlaybackUrl(null);
        setPlaybackLoading(false);
      }
    }

    if (initialMovie && initialMovie.slug === slug) {
      setMovie(initialMovie);
      setNotFound(false);
      setLoading(false);
      void resolveEntitlement(initialMovie);
      return () => {
        cancelled = true;
      };
    }

    setPlaybackUrl(null);
    setPlaybackLoading(false);
    setCanPlay(false);
    setLoading(true);

    const purchasesPromise = loggedIn ? listPurchases().catch(() => []) : Promise.resolve([]);

    Promise.all([getMovie(slug), purchasesPromise])
      .then(async ([m, purchases]) => {
        if (cancelled) return;
        setMovie(m);
        const entitled = canWatchMovie(m, {
          ownedIds: new Set(purchases.map((p) => p.content_id)),
          isAdmin,
        });
        setCanPlay(loggedIn && entitled);
        if (loggedIn && entitled) {
          setPlaybackLoading(true);
          try {
            const url = await getPlaybackUrl(m.id);
            if (!cancelled) setPlaybackUrl(url);
          } catch {
            if (!cancelled) setPlaybackUrl(null);
          } finally {
            if (!cancelled) setPlaybackLoading(false);
          }
        }
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [slug, router, loggedIn, isAdmin]);

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
    playbackLoading,
    loggedIn,
    ...derived,
  };
}
