"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { getMovie } from "@/lib/api/movies";
import { listPurchases } from "@/lib/api/purchases";
import type { ContentRead } from "@/lib/api/types";
import { getWatchProgress } from "@/lib/api/playback";
import { isAdminUser } from "@/lib/auth/is-admin";
import { swallow } from "@/lib/log";
import {
  getCachedPlaybackUrl,
  prefetchPlaybackUrl,
  resolvePlaybackUrl,
} from "@/lib/watch/playback-cache";

function isMovieFree(movie: ContentRead) {
  // "Free movies today" picks are free regardless of their normal price.
  if (movie.is_free_today) return true;
  return !movie.price_usd || parseFloat(movie.price_usd) === 0;
}

/**
 * Playback state to show while entitlement is being (re)resolved for the given
 * inputs: instant playback when a free/admin-viewable movie is already cached,
 * a loading pass when the movie is known, idle otherwise. Free movies play for
 * anyone (guest or logged in), so this never needs login state.
 */
function startingPlaybackState(
  movie: ContentRead | null,
  isAdmin: boolean,
): { canPlay: boolean; playbackUrl: string | null; playbackLoading: boolean } {
  if (!movie) {
    return { canPlay: false, playbackUrl: null, playbackLoading: false };
  }
  const free = isMovieFree(movie);
  const cached = getCachedPlaybackUrl(movie.id);
  if ((free || isAdmin) && cached) {
    return { canPlay: true, playbackUrl: cached, playbackLoading: false };
  }
  return { canPlay: free || isAdmin, playbackUrl: null, playbackLoading: true };
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
  const isSeeded = Boolean(initialMovie && initialMovie.slug === slug);
  const seedMovie = isSeeded ? initialMovie : null;
  const seedPlayback = startingPlaybackState(seedMovie, isAdmin);

  const [movie, setMovie] = useState<ContentRead | null>(seedMovie);
  const [loading, setLoading] = useState(!isSeeded && Boolean(slug));
  const [canPlay, setCanPlay] = useState(seedPlayback.canPlay);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(seedPlayback.playbackUrl);
  const [playbackLoading, setPlaybackLoading] = useState(seedPlayback.playbackLoading);
  const [resumeTime, setResumeTime] = useState<number | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Reset content state when the slug changes (adjust-state-during-render pattern).
  const [prevSlug, setPrevSlug] = useState(slug);
  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setMovie(seedMovie);
    setNotFound(false);
    setLoading(!isSeeded && Boolean(slug));
  }

  // Reset playback state when the entitlement inputs change; the effect below
  // re-resolves entitlement asynchronously after each such change.
  const playbackKey = `${slug}|${loggedIn}|${isAdmin}`;
  const [prevPlaybackKey, setPrevPlaybackKey] = useState(playbackKey);
  if (prevPlaybackKey !== playbackKey) {
    setPrevPlaybackKey(playbackKey);
    setCanPlay(seedPlayback.canPlay);
    setPlaybackUrl(seedPlayback.playbackUrl);
    setPlaybackLoading(seedPlayback.playbackLoading);
    setResumeTime(null);
  }

  const prefetchPlayback = useCallback((contentId: string) => {
    void prefetchPlaybackUrl(contentId);
  }, []);

  useEffect(() => {
    if (!slug) {
      router.replace("/movies");
      return;
    }

    let cancelled = false;

    async function resolveEntitlement(m: ContentRead) {
      const free = isMovieFree(m);

      if (free || isAdmin) {
        // Guests have no watch-progress row — and the endpoint requires login,
        // so calling it unconditionally would 401 and trip the global
        // redirect-to-login interceptor before our own .catch() ever runs.
        const progressPromise = loggedIn
          ? getWatchProgress(m.id).catch(() => null)
          : Promise.resolve(null);
        const playbackPromise = resolvePlaybackUrl(m.id);

        try {
          const [progress, url] = await Promise.all([progressPromise, playbackPromise]);
          if (cancelled) return;
          setCanPlay(true);
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

      const purchasesPromise = listPurchases().catch(swallow("watch: load purchases", []));
      const playbackPromise = getCachedPlaybackUrl(m.id)
        ? resolvePlaybackUrl(m.id)
        : prefetchPlaybackUrl(m.id).then((url) => url ?? resolvePlaybackUrl(m.id));

      try {
        const [purchases, url, progress] = await Promise.all([
          purchasesPromise,
          playbackPromise,
          loggedIn ? getWatchProgress(m.id).catch(() => null) : Promise.resolve(null),
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
      void resolveEntitlement(initialMovie);
      return () => {
        cancelled = true;
      };
    }

    const purchasesPromise = listPurchases().catch(swallow("watch: load purchases", []));

    Promise.all([getMovie(slug), purchasesPromise])
      .then(async ([m, purchases]) => {
        if (cancelled) return;
        setMovie(m);

        const free = isMovieFree(m);
        const entitled = isAdmin || free || purchases.some((p) => p.content_id === m.id);
        setCanPlay(entitled);

        if (!entitled) {
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
            loggedIn ? getWatchProgress(m.id).catch(() => null) : Promise.resolve(null),
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

  const priceLabel = useMemo(() => {
    if (!movie?.price_usd) return null;
    return `$${parseFloat(movie.price_usd).toFixed(2)}`;
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
    priceLabel,
  };
}
