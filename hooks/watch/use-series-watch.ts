"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { getPlaybackUrl } from "@/lib/api/playback";
import { getSeries, listEpisodes } from "@/lib/api/series";
import { listMySubscriptions } from "@/lib/api/subscriptions";
import type { ContentRead, SeasonRead, SeriesRead } from "@/lib/api/types";
import { isAdminUser } from "@/lib/auth/is-admin";

type UseSeriesWatchParams = {
  seriesSlug: string;
  playback: string[];
  /** Seeded from the Server Component so first paint has catalog data already. */
  initialSeries?: SeriesRead | null;
  initialSeasons?: SeasonRead[];
};

export function useSeriesWatch({
  seriesSlug,
  playback,
  initialSeries = null,
  initialSeasons = [],
}: UseSeriesWatchParams) {
  const router = useRouter();
  const { loggedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = isAdminUser(user);

  const seasonNum = playback[0] ? parseInt(playback[0], 10) : 1;
  const episodeNum = playback[1] ? parseInt(playback[1], 10) : 1;

  const isSeeded = Boolean(initialSeries && initialSeries.slug === seriesSlug);

  const [series, setSeries] = useState<SeriesRead | null>(isSeeded ? initialSeries : null);
  const [seasons, setSeasons] = useState<SeasonRead[]>(isSeeded ? initialSeasons : []);
  const [loading, setLoading] = useState(!isSeeded);
  const [notFound, setNotFound] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const playbackCacheRef = useRef<Map<string, string>>(new Map());

  // Catalog (series + episodes): seeded from the Server Component when the slug
  // matches; otherwise fetched on the client (with the module-level catalog
  // cache). Subscriptions always need the client-only auth token.
  useEffect(() => {
    if (playback.length === 0) {
      router.replace(`/watch/series/${seriesSlug}/1/1`);
      return;
    }

    let cancelled = false;
    const subsPromise = loggedIn ? listMySubscriptions().catch(() => []) : Promise.resolve([]);

    if (initialSeries && initialSeries.slug === seriesSlug) {
      setSeries(initialSeries);
      setSeasons(initialSeasons);
      setNotFound(false);
      setLoading(false);
      subsPromise.then((subs) => {
        if (cancelled) return;
        setHasSubscription(subs.some((sub) => sub.status === "active"));
      });
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    Promise.all([getSeries(seriesSlug), listEpisodes(seriesSlug), subsPromise])
      .then(([s, seasonList, subs]) => {
        if (cancelled) return;
        setSeries(s);
        setSeasons(seasonList);
        setHasSubscription(subs.some((sub) => sub.status === "active"));
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // initialSeries/initialSeasons are read from the closure and are keyed to
    // seriesSlug by the server; re-running on slug change re-seeds correctly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesSlug, playback.length, router, loggedIn]);

  const activeSeason = useMemo(
    () => seasons.find((s) => s.season_number === seasonNum),
    [seasons, seasonNum],
  );

  const episode = useMemo(
    () => activeSeason?.episodes.find((e) => e.episode_number === episodeNum),
    [activeSeason, episodeNum],
  );

  /** Warm the playback-URL cache for an entitled episode (no-op if already cached). */
  const warmPlayback = useCallback(
    (ep: ContentRead | undefined | null) => {
      if (!ep || !loggedIn) return;
      const entitled = isAdmin || ep.is_free === true || hasSubscription;
      if (!entitled) return;
      if (playbackCacheRef.current.has(ep.id)) return;
      getPlaybackUrl(ep.id)
        .then((url) => playbackCacheRef.current.set(ep.id, url))
        .catch(() => {
          /* best-effort prefetch */
        });
    },
    [loggedIn, hasSubscription, isAdmin],
  );

  /** Exposed for hover/focus prefetch from the episode list. */
  const prefetchEpisode = useCallback(
    (episodeId: string, isFree: boolean) => {
      if (!loggedIn) return;
      if (!(isAdmin || isFree || hasSubscription)) return;
      if (playbackCacheRef.current.has(episodeId)) return;
      getPlaybackUrl(episodeId)
        .then((url) => playbackCacheRef.current.set(episodeId, url))
        .catch(() => {
          /* best-effort prefetch */
        });
    },
    [loggedIn, hasSubscription, isAdmin],
  );

  // Resolve the current episode's playback URL. A cached entry (warmed by
  // prefetch) renders the player instantly, so switching episodes doesn't flash
  // a spinner; the request still runs in the background to refresh the token.
  useEffect(() => {
    const entitled = Boolean(episode && (isAdmin || episode.is_free === true || hasSubscription));
    if (!episode || !entitled || !loggedIn) {
      setPlaybackUrl(null);
      setPlaybackLoading(false);
      return;
    }
    let cancelled = false;
    const cached = playbackCacheRef.current.get(episode.id);
    if (cached) {
      setPlaybackUrl(cached);
    }
    setPlaybackLoading(!cached);

    getPlaybackUrl(episode.id)
      .then((url) => {
        if (cancelled) return;
        playbackCacheRef.current.set(episode.id, url);
        setPlaybackUrl(url);
      })
      .catch(() => !cancelled && setPlaybackUrl(null))
      .finally(() => !cancelled && setPlaybackLoading(false));
    return () => {
      cancelled = true;
    };
  }, [episode, hasSubscription, isAdmin, loggedIn, seriesSlug, seasonNum, episodeNum]);

  // Prefetch the neighbouring episodes so forward/back navigation is instant.
  useEffect(() => {
    if (!activeSeason || !episode) return;
    const eps = activeSeason.episodes;
    const idx = eps.findIndex((e) => e.episode_number === episodeNum);
    if (idx === -1) return;
    warmPlayback(eps[idx + 1]);
    warmPlayback(eps[idx - 1]);
  }, [activeSeason, episode, episodeNum, warmPlayback]);

  const derived = useMemo(() => {
    const loginNext = `/watch/series/${seriesSlug}/${seasonNum}/${episodeNum}`;
    const payHref = series
      ? `/pay/subscription?slug=${series.slug}&title=${encodeURIComponent(series.title)}&season=${seasonNum}&episode=${episodeNum}`
      : "";
    const isFree = episode?.is_free === true;
    const entitled = Boolean(episode && (isAdmin || isFree || hasSubscription));
    const canPlay = loggedIn && entitled;
    const playerTitle =
      series && episode
        ? `${series.title}: S${seasonNum} · ${episode.title}`
        : "";

    return { loginNext, payHref, isFree, canPlay, playerTitle };
  }, [
    series,
    episode,
    seriesSlug,
    seasonNum,
    episodeNum,
    loggedIn,
    isAdmin,
    hasSubscription,
  ]);

  return {
    series,
    seasons,
    loading,
    notFound,
    hasSubscription,
    playbackUrl,
    playbackLoading,
    loggedIn,
    seasonNum,
    episodeNum,
    activeSeason,
    episode,
    prefetchEpisode,
    ...derived,
  };
}
