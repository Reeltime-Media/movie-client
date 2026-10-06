"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { getSeries, listEpisodes } from "@/lib/api/series";
import { hasPurchasedSeries, listPurchasedSeries } from "@/lib/api/purchases";
import { listMySubscriptions, hasActiveSubscription } from "@/lib/api/subscriptions";
import type { ContentRead, SeasonRead, SeriesRead } from "@/lib/api/types";
import { getWatchProgress, listWatchProgress } from "@/lib/api/playback";
import { isLoggedIn } from "@/lib/api/core";
import type { WatchProgressRead } from "@/lib/api/types";
import {
  contentIdsMatch,
  episodeWatchFractions,
  mergeProgressRow,
  pickLastWatchedEpisodeId,
} from "@/lib/watch/series-progress";
import { isAdminUser } from "@/lib/auth/is-admin";
import { swallow } from "@/lib/log";
import { seriesPricingHref } from "@/lib/series-pricing";
import {
  getCachedPlaybackUrl,
  prefetchPlaybackUrl,
  resolvePlaybackUrl,
} from "@/lib/watch/playback-cache";

type UseSeriesWatchParams = {
  seriesSlug: string;
  playback: string[];
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
  // Despite the name, this means "entitled to this series" — either a full
  // subscription or a one-time per-series unlock purchase grants the same access.
  const [hasSubscription, setHasSubscription] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const [playbackRetryKey, setPlaybackRetryKey] = useState(0);
  const [resumeTime, setResumeTime] = useState<number | null>(null);
  const [seriesWatchProgress, setSeriesWatchProgress] = useState<WatchProgressRead[]>([]);

  // Reset content state when the series changes (adjust-state-during-render pattern).
  const [prevSeriesSlug, setPrevSeriesSlug] = useState(seriesSlug);
  if (prevSeriesSlug !== seriesSlug) {
    setPrevSeriesSlug(seriesSlug);
    setSeries(isSeeded ? initialSeries : null);
    setSeasons(isSeeded ? initialSeasons : []);
    setLoading(!isSeeded);
    setNotFound(false);
  }

  useEffect(() => {
    if (playback.length === 0) {
      router.replace(`/watch/series/${seriesSlug}/1/1`);
      return;
    }

    let cancelled = false;
    const subsPromise = loggedIn
      ? listMySubscriptions().catch(swallow("watch: load subscriptions", []))
      : Promise.resolve([]);
    const seriesPurchasesPromise = listPurchasedSeries().catch(
      swallow("watch: load series purchases", []),
    );

    if (initialSeries && initialSeries.slug === seriesSlug) {
      Promise.all([subsPromise, seriesPurchasesPromise]).then(([subs, seriesPurchases]) => {
        if (cancelled) return;
        setHasSubscription(
          hasActiveSubscription(subs) || hasPurchasedSeries(seriesPurchases, initialSeries.id),
        );
      });
      return () => {
        cancelled = true;
      };
    }

    Promise.all([getSeries(seriesSlug), listEpisodes(seriesSlug), subsPromise, seriesPurchasesPromise])
      .then(([s, seasonList, subs, seriesPurchases]) => {
        if (cancelled) return;
        setSeries(s);
        setSeasons(seasonList);
        setNotFound(false);
        setHasSubscription(
          hasActiveSubscription(subs) || hasPurchasedSeries(seriesPurchases, s.id),
        );
      })
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
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

  const warmPlayback = useCallback(
    (ep: ContentRead | undefined | null) => {
      if (!ep) return;
      const entitled = isAdmin || ep.is_free === true || hasSubscription;
      if (!entitled) return;
      void prefetchPlaybackUrl(ep.id);
    },
    [hasSubscription, isAdmin],
  );

  const prefetchEpisode = useCallback(
    (episodeId: string) => {
      if (!(isAdmin || hasSubscription)) {
        const ep = activeSeason?.episodes.find((e) => e.id === episodeId);
        if (!ep?.is_free) return;
      }
      void prefetchPlaybackUrl(episodeId);
    },
    [hasSubscription, isAdmin, activeSeason],
  );

  // Reset playback state when the target episode or entitlement inputs change
  // (adjust-state-during-render pattern; the sentinel makes it run on mount so
  // seeded pages pick up cached playback immediately). The effect below then
  // re-resolves playback asynchronously.
  const playbackEntitled = Boolean(
    episode && (isAdmin || episode.is_free === true || hasSubscription),
  );
  const playbackKey = `${episode?.id ?? "none"}|${playbackEntitled}`;
  const [prevPlaybackKey, setPrevPlaybackKey] = useState<string | null>(null);
  if (prevPlaybackKey !== playbackKey) {
    setPrevPlaybackKey(playbackKey);
    const cached = playbackEntitled && episode ? getCachedPlaybackUrl(episode.id) : undefined;
    setPlaybackUrl(cached ?? null);
    setPlaybackLoading(playbackEntitled && !cached);
    setPlaybackError(false);
    setResumeTime(null);
  }

  const retryPlayback = useCallback(() => {
    setPlaybackError(false);
    setPlaybackUrl(null);
    setPlaybackLoading(true);
    setPlaybackRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!episode || !playbackEntitled) return;

    let cancelled = false;
    const isFree = episode.is_free === true;

    // Guests have no watch-progress row — and the endpoint requires login,
    // so calling it unconditionally would 401 and trip the global
    // redirect-to-login interceptor before our own .catch() ever runs.
    const progressPromise = loggedIn
      ? getWatchProgress(episode.id).catch(() => null)
      : Promise.resolve(null);

    const resolvePlayback = async () => {
      if (isFree || isAdmin) {
        return resolvePlaybackUrl(episode.id);
      }

      const subsPromise = hasSubscription
        ? Promise.resolve(true)
        : listMySubscriptions()
            .then(hasActiveSubscription)
            .catch(() => false);

      const [hasSub, url] = await Promise.all([
        subsPromise,
        resolvePlaybackUrl(episode.id),
      ]);

      if (!hasSub && !isAdmin) {
        throw new Error("not entitled");
      }
      return url;
    };

    Promise.all([progressPromise, resolvePlayback()])
      .then(([progress, url]) => {
        if (cancelled) return;
        if (progress) {
          setSeriesWatchProgress((prev) => mergeProgressRow(prev, progress));
          if (!progress.completed && progress.position_seconds > 0) {
            setResumeTime(progress.position_seconds);
          } else {
            setResumeTime(null);
          }
        } else {
          setResumeTime(null);
        }
        setPlaybackError(false);
        setPlaybackUrl(url);
      })
      .catch(() => {
        if (!cancelled) {
          setPlaybackUrl(null);
          setResumeTime(null);
          setPlaybackError(true);
        }
      })
      .finally(() => !cancelled && setPlaybackLoading(false));

    return () => {
      cancelled = true;
    };
  }, [
    episode,
    playbackEntitled,
    hasSubscription,
    isAdmin,
    loggedIn,
    seriesSlug,
    seasonNum,
    episodeNum,
    playbackRetryKey,
  ]);

  const refreshSeriesWatchProgress = useCallback(() => {
    if (seasons.length === 0) return;
    if (!isLoggedIn()) {
      setSeriesWatchProgress([]);
      return;
    }
    listWatchProgress()
      .catch(swallow("series watch: load progress list", []))
      .then((rows) => {
        setSeriesWatchProgress((prev) => {
          const merged = new Map<string, WatchProgressRead>();
          for (const row of rows) {
            merged.set(row.content_id.trim().toLowerCase(), row);
          }
          for (const row of prev) {
            const key = row.content_id.trim().toLowerCase();
            const existing = merged.get(key);
            if (!existing || row.last_watched_at > existing.last_watched_at) {
              merged.set(key, row);
            }
          }
          return [...merged.values()];
        });
      });
  }, [seasons.length]);

  const applyLocalWatchProgress = useCallback(
    (patch: {
      contentId: string;
      positionSeconds: number;
      completed: boolean;
    }) => {
      if (!isLoggedIn()) return;
      setSeriesWatchProgress((prev) =>
        mergeProgressRow(prev, {
          user_id: "",
          content_id: patch.contentId,
          position_seconds: patch.positionSeconds,
          completed: patch.completed,
          last_watched_at: new Date().toISOString(),
        }),
      );
    },
    [],
  );

  useEffect(() => {
    if (seasons.length === 0) return;
    // Schedule so we never call setState synchronously inside the effect body.
    const timer = window.setTimeout(() => refreshSeriesWatchProgress(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshSeriesWatchProgress, seasonNum, episodeNum, seasons]);

  useEffect(() => {
    if (!loggedIn) return;
    const timer = window.setInterval(refreshSeriesWatchProgress, 25_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshSeriesWatchProgress();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loggedIn, refreshSeriesWatchProgress]);

  const currentEpisodeProgress = useMemo(() => {
    if (!episode?.id) return null;
    return (
      seriesWatchProgress.find((row) => contentIdsMatch(row.content_id, episode.id)) ??
      null
    );
  }, [seriesWatchProgress, episode]);

  const lastWatchedEpisodeId = useMemo(() => {
    if (!isLoggedIn() || seasons.length === 0) return null;
    const boostPos =
      resumeTime ??
      (currentEpisodeProgress && !currentEpisodeProgress.completed
        ? currentEpisodeProgress.position_seconds
        : null) ??
      (currentEpisodeProgress?.completed ? currentEpisodeProgress.position_seconds : null);
    return pickLastWatchedEpisodeId(seriesWatchProgress, seasons, {
      boostEpisodeId: episode?.id ?? null,
      boostPositionSeconds: boostPos,
      seriesSlug: series?.slug,
    });
  }, [
    seasons,
    seriesWatchProgress,
    episode?.id,
    resumeTime,
    series?.slug,
    currentEpisodeProgress,
  ]);

  const episodeWatchProgress = useMemo(() => {
    if (!isLoggedIn() || seasons.length === 0) return new Map<string, number>();
    return episodeWatchFractions(seriesWatchProgress, seasons, series?.slug);
  }, [seasons, seriesWatchProgress, series?.slug]);

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
      ? seriesPricingHref({
          slug: series.slug,
          season: seasonNum,
          episode: episodeNum,
          title: series.title,
        })
      : "/pricing";
    const isFree = episode?.is_free === true;
    const entitled = Boolean(episode && (isAdmin || isFree || hasSubscription));
    const canPlay = entitled;
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
    isAdmin,
    hasSubscription,
  ]);

  return {
    series,
    seasons,
    loading,
    notFound,
    hasSubscription,
    isAdmin,
    playbackUrl,
    playbackLoading,
    playbackError,
    resumeTime,
    loggedIn,
    seasonNum,
    episodeNum,
    activeSeason,
    episode,
    prefetchEpisode,
    retryPlayback,
    lastWatchedEpisodeId,
    episodeWatchProgress,
    refreshSeriesWatchProgress,
    applyLocalWatchProgress,
    ...derived,
  };
}
