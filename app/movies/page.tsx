import { MoviesView } from "@/components/catalog/MoviesView";
import { listMovies } from "@/lib/api/movies";
import { swallow } from "@/lib/log";

// Public catalog is cached/revalidated on the server (ISR). Must be a literal —
// Next statically analyzes this; keep in sync with CATALOG_REVALIDATE_SECONDS.
export const revalidate = 300;

type MoviesPageProps = {
  searchParams: Promise<{ genre?: string; free?: string }>;
};

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const { genre, free } = await searchParams;
  const movies = await listMovies().catch(swallow("movies: load catalog", []));

  return (
    <MoviesView
      movies={movies}
      initialGenreLabel={genre?.trim() ?? ""}
      initialFree={free === "1"}
    />
  );
}
