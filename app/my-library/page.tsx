import { MyLibraryView } from "@/components/library/MyLibraryView";
import { listMovies } from "@/lib/api/movies";
import { listSeries } from "@/lib/api/series";
import { swallow } from "@/lib/log";

// Public catalog is cached/revalidated on the server (ISR) so it never blocks
// the client render. Must be a literal — keep in sync with CATALOG_REVALIDATE_SECONDS.
export const revalidate = 300;

export default async function MyLibraryPage() {
  // Fetch the catalog server-side (cached) instead of from the client, where
  // it was an uncached, sequential full-catalog download on every visit.
  // Series too: favourites can point at either (the button is on series pages).
  const [catalogMovies, catalogSeries] = await Promise.all([
    listMovies().catch(swallow("my-library: load catalog", [])),
    listSeries().catch(swallow("my-library: load series catalog", [])),
  ]);

  return <MyLibraryView catalogMovies={catalogMovies} catalogSeries={catalogSeries} />;
}
