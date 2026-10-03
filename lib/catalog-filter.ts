import type { TranslationKey } from "@/lib/i18n";

/** Shared genre filter options for movies and series catalog pages. */
const CATALOG_GENRE_KEYS = [
  "genreAll",
  "genreAction",
  "genreThriller",
  "genreDrama",
  "genreSciFi",
  "genreHorror",
  "genreComedy",
  "genreAdventure",
  "genreAnimation",
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
  genreAdventure: "Adventure",
  genreAnimation: "Animation",
};

/**
 * Region codes stored on `content.region` (set in the admin), with the nav
 * labels used for the Movies/Series dropdowns and the filtered page title.
 */
export const CATALOG_REGIONS = {
  US: { movies: "navCatHollywood", series: "navCatHollywood" },
  CH: { movies: "navChineseMovies", series: "navChineseSeries" },
  KR: { movies: "navKoreanMovies", series: "navKoreanSeries" },
  Hindi: { movies: "navIndiaMovies", series: "navIndiaSeries" },
  INDO: { movies: "navIndonesiaMovies", series: "navIndonesiaSeries" },
} as const satisfies Record<string, { movies: TranslationKey; series: TranslationKey }>;

export type CatalogRegionCode = keyof typeof CATALOG_REGIONS;

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

/** First non-empty genre — the only one shown on customer UIs. */
export function primaryGenre(
  genres: readonly string[] | null | undefined,
): string | undefined {
  for (const raw of genres ?? []) {
    const label = raw.trim();
    if (label) return label;
  }
  return undefined;
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
  const primary = primaryGenre(item.genres);
  return primary != null && normalizeGenreLabel(primary) === needle;
}

function normalizeRegion(code: string): string {
  return code.trim().toLowerCase();
}

/** Match a region code from ?region= (case-insensitive); empty matches everything. */
export function matchesRegion(
  item: { region?: string | null },
  code: string | null | undefined,
): boolean {
  if (!code?.trim()) return true;
  return item.region != null && normalizeRegion(item.region) === normalizeRegion(code);
}

/** Nav label for a known region code (e.g. "CH" → "Chinese Movies"), else undefined. */
export function regionLabelKey(
  code: string | null | undefined,
  kind: "movies" | "series",
): TranslationKey | undefined {
  if (!code?.trim()) return undefined;
  const needle = normalizeRegion(code);
  for (const [known, labels] of Object.entries(CATALOG_REGIONS)) {
    if (normalizeRegion(known) === needle) return labels[kind];
  }
  return undefined;
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
    const label = primaryGenre(item.genres);
    if (!label) continue;
    const key = normalizeGenreLabel(label);
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { label, count: 1 });
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map((entry) => entry.label);
}
