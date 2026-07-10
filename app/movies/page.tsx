import { MoviesView } from "@/components/catalog/MoviesView";
import { listMovies } from "@/lib/api/movies";
import { movieToPoster } from "@/lib/api/to-poster";
import { genreKeyFromLabel } from "@/lib/catalog-filter";

// Public catalog is cached/revalidated on the server (ISR). Must be a literal —
// Next statically analyzes this; keep in sync with CATALOG_REVALIDATE_SECONDS.
export const revalidate = 300;

type MoviesPageProps = {
  searchParams: Promise<{ genre?: string }>;
};

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const { genre } = await searchParams;
  const movies = await listMovies().catch(() => []);

  // Public (signed-out) posters rendered into the initial HTML for fast LCP.
  const initialPosters = movies.map((m, i) => movieToPoster(m, i, new Set<string>()));

  return (
    <MoviesView
      movies={movies}
      initialPosters={initialPosters}
      initialGenre={genreKeyFromLabel(genre)}
    />
  );
}
