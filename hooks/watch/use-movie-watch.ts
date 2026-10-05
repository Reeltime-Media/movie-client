"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { getMovie } from "@/lib/api/movies";
import type { ContentRead } from "@/lib/api/types";
import { getWatchProgress } from "@/lib/api/playback";
import { isAdminUser } from "@/lib/auth/is-admin";
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

type ApiError = Error & { status?: number };

function isForbidden(err: unknown): boolean {
  return Boolean(
    err && typeof err === "object" && "status" in err && Number((err as ApiError).status) === 403,
  );
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

async function loadResumeTime(contentId: string, loggedIn: boolean): Promise<number | null> {
  if (!loggedIn) return null;
  const progress = await getWatchProgress(contentId).catch(() => null);
  if (progress && !progress.completed && progress.position_seconds > 0) {
    return progress.position_seconds;
  }
  return null;
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
  const seedIsFree = seedMovie ? isMovieFree(seedMovie) : false;

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

  // Free movies don't depend on login — omit loggedIn from the key so auth
  // hydration doesn't tear down a stream that already started for a guest.
  const playbackKey =
    seedIsFree || isAdmin ? `${slug}|free|${isAdmin}` : `${slug}|${loggedIn}|${isAdmin}`;
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

    async function startPlayback(m: ContentRead) {
      const cachedUrl = getCachedPlaybackUrl(m.id);
      if (cachedUrl) {
        setPlaybackUrl(cachedUrl);
        setPlaybackLoading(false);
      } else {
        setPlaybackLoading(true);
      }

      // Progress must NOT gate the stream URL — a 404 resume lookup was adding
      // a full RTT before the player could mount. Apply it after authorize.
      const progressPromise = loadResumeTime(m.id, loggedIn);

      try {
        const url = await resolvePlaybackUrl(m.id);
        if (cancelled) return;
        setCanPlay(true);
        setPlaybackUrl(url);
        setPlaybackLoading(false);
      } catch (err) {
        if (cancelled) return;
        if (isForbidden(err)) {
          setCanPlay(false);
          setPlaybackUrl(null);
          setResumeTime(null);
          setPlaybackLoading(false);
          return;
        }
        setPlaybackUrl(null);
        setPlaybackLoading(false);
        return;
      }

      const resume = await progressPromise;
      if (!cancelled && resume !== null) setResumeTime(resume);
    }

    async function resolveEntitlement(m: ContentRead) {
      const free = isMovieFree(m);

      if (free || isAdmin) {
        await startPlayback(m);
        return;
      }

      // Authorize is the source of truth for entitlement (server re-checks).
      // Don't wait on purchases/subscriptions lists — those were doubling TTFF.
      await startPlayback(m);
    }

    if (initialMovie && initialMovie.slug === slug) {
      void resolveEntitlement(initialMovie);
      return () => {
        cancelled = true;
      };
    }

    // Unseeded: fetch movie metadata first, then start playback. Purchases/subs
    // stay off the critical path (authorize decides).
    getMovie(slug)
      .then(async (m) => {
        if (cancelled) return;
        setMovie(m);
        const free = isMovieFree(m);
        if (free || isAdmin) {
          setCanPlay(true);
          await startPlayback(m);
          return;
        }
        // Optimistic loading spinner while authorize decides.
        setPlaybackLoading(true);
        await startPlayback(m);
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
