import type { TranslationKey } from "@/lib/i18n";

/** English genre labels stored in the API (matches en dictionary). */
export const GENRE_KEY_TO_LABEL: Partial<Record<TranslationKey, string>> = {
  genreAction: "Action",
  genreDrama: "Drama",
  genreThriller: "Thriller",
  genreSciFi: "Sci-Fi",
  genreComedy: "Comedy",
  genreCrime: "Crime",
  genreHorror: "Horror",
};

export type CatalogSearchable = {
  title: string;
  description?: string | null;
  genres: string[];
};

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesSearch(item: CatalogSearchable, query: string): boolean {
  const q = normalizeSearchQuery(query);
  if (!q) return true;
  if (item.title.toLowerCase().includes(q)) return true;
  if (item.description?.toLowerCase().includes(q)) return true;
  if (item.genres.some((g) => g.toLowerCase().includes(q))) return true;
  return false;
}

export function matchesGenre(item: CatalogSearchable, genreKey: TranslationKey): boolean {
  if (genreKey === "genreAll") return true;
  const label = GENRE_KEY_TO_LABEL[genreKey];
  if (!label) return true;
  const needle = label.toLowerCase();
  return item.genres.some((g) => g.toLowerCase() === needle);
}

export function genreLabelForKey(genreKey: TranslationKey): string | undefined {
  return GENRE_KEY_TO_LABEL[genreKey];
}
