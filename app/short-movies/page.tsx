import { ShortMoviesView } from "@/components/catalog/ShortMoviesView";
import { listSeries } from "@/lib/api/series";
import { swallow } from "@/lib/log";

// Public catalog is cached/revalidated on the server (ISR), same as /series.
export const revalidate = 300;

export default async function ShortMoviesPage() {
  // Free-episode CTAs use `free_episode_count` from the list API — skip the
  // per-series listEpisodes fan-out that blocked this page.
  const seriesList = await listSeries({ short: true }).catch(swallow("short-movies: load series", []));

  return <ShortMoviesView seriesList={seriesList} />;
}
