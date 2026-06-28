import { MyLibraryView } from "@/components/library/MyLibraryView";
import { listMovies } from "@/lib/api/movies";

// Public catalog is cached/revalidated on the server (ISR) so it never blocks
// the client render. Must be a literal — keep in sync with CATALOG_REVALIDATE_SECONDS.
export const revalidate = 300;

export default async function MyLibraryPage() {
  // Fetch the catalog server-side (cached) instead of from the client, where
  // it was an uncached, sequential full-catalog download on every visit.
  const catalogMovies = await listMovies().catch(() => []);

  return <MyLibraryView catalogMovies={catalogMovies} />;
}
