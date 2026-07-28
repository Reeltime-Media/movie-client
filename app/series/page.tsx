import { SeriesView } from "@/components/catalog/SeriesView";
import { listSeries, listEpisodes } from "@/lib/api/series";
import type { SeasonRead } from "@/lib/api/types";
import { swallow } from "@/lib/log";

const SERIES_EPISODE_PREFETCH_LIMIT = 12;

// Public catalog is cached/revalidated on the server (ISR). Must be a literal —
// Next statically analyzes this; keep in sync with CATALOG_REVALIDATE_SECONDS.
export const revalidate = 300;

type SeriesPageProps = {
  searchParams: Promise<{ genre?: string; free?: string }>;
};

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const { genre, free } = await searchParams;
  const seriesList = await listSeries().catch(swallow("series: load series", []));
  const seasons = await Promise.all(
    seriesList.map((s, index) =>
      index < SERIES_EPISODE_PREFETCH_LIMIT
        ? listEpisodes(s.slug).catch(() => [] as SeasonRead[])
        : Promise.resolve([] as SeasonRead[]),
    ),
  );

  return (
    <SeriesView
      seriesList={seriesList}
      seasons={seasons}
      initialGenreLabel={genre?.trim() ?? ""}
      initialFree={free === "1"}
    />
  );
}
