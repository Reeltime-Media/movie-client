import type { PosterCardProps } from "@/app/components/PosterCard";
import { listEpisodes } from "./series";
import { seriesToPoster } from "./to-poster";
import type { SeasonRead, SeriesRead } from "./types";

export async function mapSeriesListToPosters(
  seriesList: SeriesRead[],
  hasSubscription: boolean,
): Promise<PosterCardProps[]> {
  if (!seriesList.length) return [];

  const seasonsBySeries = await Promise.all(
    seriesList.map((s) => listEpisodes(s.slug).catch(() => [] as SeasonRead[])),
  );

  return seriesList.map((series, index) =>
    seriesToPoster(series, index, {
      hasSubscription,
      seasons: seasonsBySeries[index],
    }),
  );
}
