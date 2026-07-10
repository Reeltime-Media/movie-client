import type { TranslationKey } from "@/lib/i18n";

import { genreLabelFromKey, type CatalogGenreKey } from "./catalog-filter";

export type HomeGenreRailConfig = {
  genreKey: Exclude<CatalogGenreKey, "genreAll">;
  titleKey: TranslationKey;
};

/** Home page poster rails — each maps to a real catalog genre filter. */
export const HOME_GENRE_RAILS: readonly HomeGenreRailConfig[] = [
  { genreKey: "genreAction", titleKey: "homeGenreAction" },
  { genreKey: "genreComedy", titleKey: "homeGenreComedy" },
  { genreKey: "genreDrama", titleKey: "homeGenreDrama" },
  { genreKey: "genreThriller", titleKey: "homeLateNightThrillers" },
  { genreKey: "genreHorror", titleKey: "homeGenreHorror" },
  { genreKey: "genreSciFi", titleKey: "homeGenreSciFi" },
] as const;

export function moviesGenreHref(genreKey: TranslationKey): string {
  const label = genreLabelFromKey(genreKey);
  return label ? `/movies?genre=${encodeURIComponent(label)}` : "/movies";
}
