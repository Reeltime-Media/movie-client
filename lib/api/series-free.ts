import type { SeasonRead } from "./types";

export type FreeEpisodePlayback = {
  season: number;
  episode: number;
};

export function seasonsHaveFreeEpisodes(seasons: SeasonRead[]): boolean {
  return seasons.some((season) =>
    season.episodes.some((ep) => ep.is_free === true),
  );
}

export function findFirstFreeEpisode(seasons: SeasonRead[]): FreeEpisodePlayback | null {
  const sortedSeasons = [...seasons].sort((a, b) => a.season_number - b.season_number);
  for (const season of sortedSeasons) {
    const freeEpisodes = season.episodes
      .filter((ep) => ep.is_free === true)
      .sort((a, b) => (a.episode_number ?? 0) - (b.episode_number ?? 0));
    if (freeEpisodes.length > 0) {
      return {
        season: season.season_number,
        episode: freeEpisodes[0].episode_number ?? 1,
      };
    }
  }
  return null;
}

export function freeEpisodeWatchHref(
  seriesSlug: string,
  playback: FreeEpisodePlayback,
): string {
  return `/watch/series/${seriesSlug}/${playback.season}/${playback.episode}`;
}
