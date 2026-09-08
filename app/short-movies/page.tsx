import { ShortMoviesView } from "@/components/catalog/ShortMoviesView";
import { listSeries, listEpisodes } from "@/lib/api/series";
import type { SeasonRead } from "@/lib/api/types";
import { swallow } from "@/lib/log";

// Public catalog is cached/revalidated on the server (ISR), same as /series.
export const revalidate = 300;

export default async function ShortMoviesPage() {
  const seriesList = await listSeries({ short: true }).catch(swallow("short-movies: load series", []));
  const seasons = await Promise.all(
    seriesList.map((s) => listEpisodes(s.slug).catch(() => [] as SeasonRead[])),
  );

  return <ShortMoviesView seriesList={seriesList} seasons={seasons} />;
}
