import type { TranslationKey } from "@/lib/i18n";

/** Shared genre filter options for movies and series catalog pages. */
export const CATALOG_GENRE_KEYS = [
  "genreAll",
  "genreAction",
  "genreThriller",
  "genreDrama",
  "genreSciFi",
  "genreHorror",
  "genreComedy",
] as const satisfies readonly TranslationKey[];

export type CatalogGenreKey = (typeof CATALOG_GENRE_KEYS)[number];

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

export function normalizeGenreLabel(label: string): string {
  return label.trim().toLowerCase().replace(/[-\s]/g, "");
}

export function genreLabelFromKey(genreKey: TranslationKey): string | undefined {
  return GENRE_KEY_TO_LABEL[genreKey];
}

/** Map an API/catalog genre label (e.g. "Thriller") to a filter key. */
export function genreKeyFromLabel(label: string | null | undefined): CatalogGenreKey {
  if (!label?.trim()) return "genreAll";
  const needle = normalizeGenreLabel(label);
  for (const key of CATALOG_GENRE_KEYS) {
    if (key === "genreAll") continue;
    const mapped = GENRE_KEY_TO_LABEL[key];
    if (mapped && normalizeGenreLabel(mapped) === needle) return key;
  }
  return "genreAll";
}

export function matchesGenre(item: CatalogSearchable, genreKey: TranslationKey): boolean {
  if (genreKey === "genreAll") return true;
  const label = GENRE_KEY_TO_LABEL[genreKey];
  if (!label) return true;
  const needle = normalizeGenreLabel(label);
  return item.genres.some((g) => normalizeGenreLabel(g) === needle);
}

export function filterByGenre<T extends CatalogSearchable>(
  items: readonly T[],
  genreKey: TranslationKey,
): T[] {
  if (genreKey === "genreAll") return [...items];
  return items.filter((item) => matchesGenre(item, genreKey));
}

export function genreLabelForKey(genreKey: TranslationKey): string | undefined {
  return GENRE_KEY_TO_LABEL[genreKey];
}
