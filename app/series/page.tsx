import { SeriesView } from "../components/SeriesView";
import { listSeries, listEpisodes } from "@/lib/api/series";
import { seriesToPoster } from "@/lib/api/to-poster";
import type { SeasonRead } from "@/lib/api/types";

// Public catalog is cached/revalidated on the server (ISR). Must be a literal —
// Next statically analyzes this; keep in sync with CATALOG_REVALIDATE_SECONDS.
export const revalidate = 300;

export default async function SeriesPage() {
  const seriesList = await listSeries().catch(() => []);
  const seasons = await Promise.all(
    seriesList.map((s) => listEpisodes(s.slug).catch(() => [] as SeasonRead[])),
  );

  // Public (signed-out) posters rendered into the initial HTML for fast LCP.
  const all = seriesList.map((s, i) =>
    seriesToPoster(s, i, { hasSubscription: false, seasons: seasons[i] ?? [] }),
  );
  const half = Math.ceil(all.length / 2);

  return (
    <SeriesView
      seriesList={seriesList}
      seasons={seasons}
      initialSubscribe={all.slice(0, half)}
      initialPopular={all.slice(half)}
    />
  );
}
