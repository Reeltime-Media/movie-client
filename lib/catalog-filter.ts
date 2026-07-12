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
const GENRE_KEY_TO_LABEL: Partial<Record<TranslationKey, string>> = {
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

function normalizeSearchQuery(query: string): string {
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

function normalizeGenreLabel(label: string): string {
  return label.trim().toLowerCase().replace(/[-\s]/g, "");
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
  return matchesGenreLabel(item, label);
}

/** Match against a raw API genre label (e.g. "Adventure", "Sci-Fi"). */
export function matchesGenreLabel(
  item: CatalogSearchable,
  label: string | null | undefined,
): boolean {
  if (!label?.trim()) return true;
  const needle = normalizeGenreLabel(label);
  return item.genres.some((g) => normalizeGenreLabel(g) === needle);
}

export function filterByGenreLabel<T extends CatalogSearchable>(
  items: readonly T[],
  label: string | null | undefined,
): T[] {
  if (!label?.trim()) return [...items];
  return items.filter((item) => matchesGenreLabel(item, label));
}

/**
 * Unique genre labels present on catalog items, ordered by frequency (desc)
 * then name. Preserves the first-seen casing for display.
 */
export function collectGenreLabels(
  items: readonly CatalogSearchable[],
): string[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const item of items) {
    const seen = new Set<string>();
    for (const raw of item.genres ?? []) {
      const label = raw.trim();
      if (!label) continue;
      const key = normalizeGenreLabel(label);
      if (seen.has(key)) continue;
      seen.add(key);
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { label, count: 1 });
      }
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map((entry) => entry.label);
}
