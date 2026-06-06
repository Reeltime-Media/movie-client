"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/hooks/auth/use-auth";
import { getPlaybackUrl } from "@/lib/api/playback";
import { getSeries, listEpisodes } from "@/lib/api/series";
import { listMySubscriptions } from "@/lib/api/subscriptions";
import type { SeasonRead, SeriesRead } from "@/lib/api/types";

type UseSeriesWatchParams = {
  seriesSlug: string;
  playback: string[];
};

export function useSeriesWatch({ seriesSlug, playback }: UseSeriesWatchParams) {
  const router = useRouter();
  const { loggedIn } = useAuth();

  const seasonNum = playback[0] ? parseInt(playback[0], 10) : 1;
  const episodeNum = playback[1] ? parseInt(playback[1], 10) : 1;

  const [series, setSeries] = useState<SeriesRead | null>(null);
  const [seasons, setSeasons] = useState<SeasonRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);

  useEffect(() => {
    if (playback.length === 0) {
      router.replace(`/watch/series/${seriesSlug}/1/1`);
      return;
    }

    const subsPromise = loggedIn ? listMySubscriptions().catch(() => []) : Promise.resolve([]);

    Promise.all([getSeries(seriesSlug), listEpisodes(seriesSlug), subsPromise])
      .then(([s, seasonList, subs]) => {
        setSeries(s);
        setSeasons(seasonList);
        setHasSubscription(subs.some((sub) => sub.status === "active"));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [seriesSlug, playback.length, router, loggedIn]);

  const activeSeason = useMemo(
    () => seasons.find((s) => s.season_number === seasonNum),
    [seasons, seasonNum],
  );

  const episode = useMemo(
    () => activeSeason?.episodes.find((e) => e.episode_number === episodeNum),
    [activeSeason, episodeNum],
  );

  useEffect(() => {
    const entitled = Boolean(episode && (episode.is_free === true || hasSubscription));
    if (!episode || !entitled || !loggedIn) {
      setPlaybackUrl(null);
      setPlaybackLoading(false);
      return;
    }
    let cancelled = false;
    setPlaybackUrl(null);
    setPlaybackLoading(true);
    getPlaybackUrl(episode.id)
      .then((url) => !cancelled && setPlaybackUrl(url))
      .catch(() => !cancelled && setPlaybackUrl(null))
      .finally(() => !cancelled && setPlaybackLoading(false));
    return () => {
      cancelled = true;
    };
  }, [episode, hasSubscription, loggedIn, seriesSlug, seasonNum, episodeNum]);

  const derived = useMemo(() => {
    const loginNext = `/watch/series/${seriesSlug}/${seasonNum}/${episodeNum}`;
    const payHref = series
      ? `/pay/subscription?slug=${series.slug}&title=${encodeURIComponent(series.title)}&season=${seasonNum}&episode=${episodeNum}`
      : "";
    const isFree = episode?.is_free === true;
    const canPlay = loggedIn && Boolean(episode && (isFree || hasSubscription));
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
    ...derived,
  };
}
