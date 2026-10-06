import { SeriesView } from "@/components/catalog/SeriesView";
import { listSeries } from "@/lib/api/series";

// Public catalog is cached/revalidated on the server (ISR). Must be a literal —
// Next statically analyzes this; keep in sync with CATALOG_REVALIDATE_SECONDS.
export const revalidate = 300;

type SeriesPageProps = {
  searchParams: Promise<{ genre?: string; free?: string; region?: string }>;
};

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const { genre, free, region } = await searchParams;
  // Short movies get their own page (/short-movies) — exclude them here so
  // the same series doesn't show up twice across the two catalogs.
  // Free-episode badges/filters use `free_episode_count` from the list API —
  // do NOT prefetch listEpisodes here (that was an N+1 waterfall).
  const result = await listSeries({ short: false })
    .then((seriesList) => ({ seriesList, loadError: false as const }))
    .catch(() => ({
      seriesList: [] as Awaited<ReturnType<typeof listSeries>>,
      loadError: true as const,
    }));

  return (
    <SeriesView
      seriesList={result.seriesList}
      initialGenreLabel={genre?.trim() ?? ""}
      initialFree={free === "1"}
      region={region?.trim() ?? ""}
      loadError={result.loadError}
    />
  );
}
