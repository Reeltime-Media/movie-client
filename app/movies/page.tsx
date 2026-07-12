import { MoviesView } from "@/components/catalog/MoviesView";
import { listMovies } from "@/lib/api/movies";

// Public catalog is cached/revalidated on the server (ISR). Must be a literal —
// Next statically analyzes this; keep in sync with CATALOG_REVALIDATE_SECONDS.
export const revalidate = 300;

type MoviesPageProps = {
  searchParams: Promise<{ genre?: string }>;
};

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const { genre } = await searchParams;
  const movies = await listMovies().catch(() => []);

  return (
    <MoviesView
      movies={movies}
      initialGenreLabel={genre?.trim() ?? ""}
    />
  );
}
