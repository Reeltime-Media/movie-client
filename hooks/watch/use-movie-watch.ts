"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { getMovie } from "@/lib/api/movies";
import { listPurchases } from "@/lib/api/purchases";
import type { ContentRead } from "@/lib/api/types";
import { getWatchProgress } from "@/lib/api/watch-progress";
import { isAdminUser } from "@/lib/auth/is-admin";
import { moviePayHref, movieWatchHref } from "@/lib/movie-routes";
import {
  getCachedPlaybackUrl,
  prefetchPlaybackUrl,
  resolvePlaybackUrl,
} from "@/lib/watch/playback-cache";

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
  const { user } = useUser();
  const isAdmin = isAdminUser(user);
  const { initialMovie = null } = options;
  const isSeeded = initialMovie && initialMovie.slug === slug;
  const [movie, setMovie] = useState<ContentRead | null>(isSeeded ? initialMovie : null);
  const [loading, setLoading] = useState(!isSeeded && Boolean(slug));
  const [canPlay, setCanPlay] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [resumeTime, setResumeTime] = useState<number | null>(null);
  const [notFound, setNotFound] = useState(false);

  const prefetchPlayback = useCallback(
    (contentId: string) => {
      if (!loggedIn) return;
      void prefetchPlaybackUrl(contentId);
    },
    [loggedIn],
  );

  useEffect(() => {
    if (!slug) {
      router.replace("/movies");
      return;
    }

    let cancelled = false;

    async function resolveEntitlement(m: ContentRead) {
      if (!loggedIn) {
        setCanPlay(false);
        setPlaybackUrl(null);
        setPlaybackLoading(false);
        setResumeTime(null);
        return;
      }

      const free = isMovieFree(m);
      const adminEntitled = isAdmin;
      const cachedUrl = getCachedPlaybackUrl(m.id);

      if (free || adminEntitled) {
        setCanPlay(true);
        if (cachedUrl) {
          setPlaybackUrl(cachedUrl);
          setPlaybackLoading(false);
        } else {
          setPlaybackLoading(true);
        }

        const progressPromise = getWatchProgress(m.id).catch(() => null);
        const playbackPromise = resolvePlaybackUrl(m.id);

        try {
          const [progress, url] = await Promise.all([progressPromise, playbackPromise]);
          if (cancelled) return;
          if (progress && !progress.completed && progress.position_seconds > 0) {
            setResumeTime(progress.position_seconds);
          } else {
            setResumeTime(null);
          }
          setPlaybackUrl(url);
        } catch {
          if (!cancelled) setPlaybackUrl(null);
        } finally {
          if (!cancelled) setPlaybackLoading(false);
        }
        return;
      }

      setPlaybackLoading(true);
      const purchasesPromise = listPurchases().catch(() => []);
      const playbackPromise = getCachedPlaybackUrl(m.id)
        ? resolvePlaybackUrl(m.id)
        : prefetchPlaybackUrl(m.id).then((url) => url ?? resolvePlaybackUrl(m.id));

      try {
        const [purchases, url, progress] = await Promise.all([
          purchasesPromise,
          playbackPromise,
          getWatchProgress(m.id).catch(() => null),
        ]);
        if (cancelled) return;

        const entitled = purchases.some((p) => p.content_id === m.id);
        setCanPlay(entitled);
        if (entitled) {
          if (progress && !progress.completed && progress.position_seconds > 0) {
            setResumeTime(progress.position_seconds);
          } else {
            setResumeTime(null);
          }
          setPlaybackUrl(url);
        } else {
          setResumeTime(null);
          setPlaybackUrl(null);
        }
      } catch {
        if (!cancelled) {
          setCanPlay(false);
          setPlaybackUrl(null);
          setResumeTime(null);
        }
      } finally {
        if (!cancelled) setPlaybackLoading(false);
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
    setResumeTime(null);
    setLoading(true);

    const purchasesPromise = loggedIn ? listPurchases().catch(() => []) : Promise.resolve([]);

    Promise.all([getMovie(slug), purchasesPromise])
      .then(async ([m, purchases]) => {
        if (cancelled) return;
        setMovie(m);

        const free = isMovieFree(m);
        const entitled = isAdmin || free || purchases.some((p) => p.content_id === m.id);
        setCanPlay(loggedIn && entitled);

        if (!loggedIn || !entitled) {
          setPlaybackUrl(null);
          setResumeTime(null);
          return;
        }

        const cachedUrl = getCachedPlaybackUrl(m.id);
        if (cachedUrl) {
          setPlaybackUrl(cachedUrl);
          setPlaybackLoading(false);
        } else {
          setPlaybackLoading(true);
        }

        try {
          const [progress, url] = await Promise.all([
            getWatchProgress(m.id).catch(() => null),
            resolvePlaybackUrl(m.id),
          ]);
          if (cancelled) return;
          if (progress && !progress.completed && progress.position_seconds > 0) {
            setResumeTime(progress.position_seconds);
          }
          setPlaybackUrl(url);
        } catch {
          if (!cancelled) setPlaybackUrl(null);
        } finally {
          if (!cancelled) setPlaybackLoading(false);
        }
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [slug, router, loggedIn, isAdmin, initialMovie]);

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
    resumeTime,
    loggedIn,
    prefetchPlayback,
    ...derived,
  };
}
