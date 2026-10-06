import { MoviesView } from "@/components/catalog/MoviesView";
import { listMovies } from "@/lib/api/movies";

// Public catalog is cached/revalidated on the server (ISR). Must be a literal —
// Next statically analyzes this; keep in sync with CATALOG_REVALIDATE_SECONDS.
export const revalidate = 300;

type MoviesPageProps = {
  searchParams: Promise<{ genre?: string; free?: string; region?: string }>;
};

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const { genre, free, region } = await searchParams;
  const result = await listMovies()
    .then((movies) => ({ movies, loadError: false as const }))
    .catch(() => ({ movies: [] as Awaited<ReturnType<typeof listMovies>>, loadError: true as const }));

  return (
    <MoviesView
      movies={result.movies}
      initialGenreLabel={genre?.trim() ?? ""}
      initialFree={free === "1"}
      region={region?.trim() ?? ""}
      loadError={result.loadError}
    />
  );
}
