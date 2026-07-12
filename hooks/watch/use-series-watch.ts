"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { getSeries, listEpisodes } from "@/lib/api/series";
import { listMySubscriptions } from "@/lib/api/subscriptions";
import type { ContentRead, SeasonRead, SeriesRead } from "@/lib/api/types";
import { getWatchProgress } from "@/lib/api/watch-progress";
import { isAdminUser } from "@/lib/auth/is-admin";
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
  const [hasSubscription, setHasSubscription] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [resumeTime, setResumeTime] = useState<number | null>(null);

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
    const subsPromise = loggedIn ? listMySubscriptions().catch(() => []) : Promise.resolve([]);

    if (initialSeries && initialSeries.slug === seriesSlug) {
      subsPromise.then((subs) => {
        if (cancelled) return;
        setHasSubscription(subs.some((sub) => sub.status === "active"));
      });
      return () => {
        cancelled = true;
      };
    }

    Promise.all([getSeries(seriesSlug), listEpisodes(seriesSlug), subsPromise])
      .then(([s, seasonList, subs]) => {
        if (cancelled) return;
        setSeries(s);
        setSeasons(seasonList);
        setNotFound(false);
        setHasSubscription(subs.some((sub) => sub.status === "active"));
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
      if (!ep || !loggedIn) return;
      const entitled = isAdmin || ep.is_free === true || hasSubscription;
      if (!entitled) return;
      void prefetchPlaybackUrl(ep.id);
    },
    [loggedIn, hasSubscription, isAdmin],
  );

  const prefetchEpisode = useCallback(
    (episodeId: string) => {
      if (!loggedIn) return;
      if (!(isAdmin || hasSubscription)) {
        const ep = activeSeason?.episodes.find((e) => e.id === episodeId);
        if (!ep?.is_free) return;
      }
      void prefetchPlaybackUrl(episodeId);
    },
    [loggedIn, hasSubscription, isAdmin, activeSeason],
  );

  // Reset playback state when the target episode or entitlement inputs change
  // (adjust-state-during-render pattern; the sentinel makes it run on mount so
  // seeded pages pick up cached playback immediately). The effect below then
  // re-resolves playback asynchronously.
  const playbackEntitled = Boolean(
    episode && loggedIn && (isAdmin || episode.is_free === true || hasSubscription),
  );
  const playbackKey = `${episode?.id ?? "none"}|${playbackEntitled}`;
  const [prevPlaybackKey, setPrevPlaybackKey] = useState<string | null>(null);
  if (prevPlaybackKey !== playbackKey) {
    setPrevPlaybackKey(playbackKey);
    const cached = playbackEntitled && episode ? getCachedPlaybackUrl(episode.id) : undefined;
    setPlaybackUrl(cached ?? null);
    setPlaybackLoading(playbackEntitled && !cached);
    setResumeTime(null);
  }

  useEffect(() => {
    if (!episode || !playbackEntitled) return;

    let cancelled = false;
    const isFree = episode.is_free === true;

    const progressPromise = getWatchProgress(episode.id).catch(() => null);

    const resolvePlayback = async () => {
      if (isFree || isAdmin) {
        return resolvePlaybackUrl(episode.id);
      }

      const subsPromise = hasSubscription
        ? Promise.resolve(true)
        : listMySubscriptions()
            .then((subs) => subs.some((s) => s.status === "active"))
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
        if (progress && !progress.completed && progress.position_seconds > 0) {
          setResumeTime(progress.position_seconds);
        } else {
          setResumeTime(null);
        }
        setPlaybackUrl(url);
      })
      .catch(() => {
        if (!cancelled) {
          setPlaybackUrl(null);
          setResumeTime(null);
        }
      })
      .finally(() => !cancelled && setPlaybackLoading(false));

    return () => {
      cancelled = true;
    };
  }, [episode, playbackEntitled, hasSubscription, isAdmin, loggedIn, seriesSlug, seasonNum, episodeNum]);

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
    resumeTime,
    loggedIn,
    seasonNum,
    episodeNum,
    activeSeason,
    episode,
    prefetchEpisode,
    ...derived,
  };
}
