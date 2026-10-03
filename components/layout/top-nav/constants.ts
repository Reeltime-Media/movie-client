import { CATALOG_REGIONS, type CatalogRegionCode } from "@/lib/catalog-filter";
import type { TranslationKey } from "@/lib/i18n";

type NavDropdownItem = {
  labelKey: TranslationKey;
  href: string;
};

export type NavLink = {
  labelKey: TranslationKey;
  href: string;
  requiresAuth?: boolean;
  /** Shows a small dropdown-style chevron next to the label (decorative). */
  hasCaret?: boolean;
  /** Category links shown in a dropdown under the tab (desktop hover menu). */
  dropdown?: NavDropdownItem[];
};

/**
 * Category entries for the Movies/Series dropdowns. Country entries filter on
 * the region code set on content in the admin (e.g. `?region=CH`); the rest
 * rely on the matching genre label being set (e.g. "Khmer").
 */
function categoryDropdown(base: "/movies" | "/series"): NavDropdownItem[] {
  const forMovies = base === "/movies";
  const genre = (label: string) => `${base}?genre=${encodeURIComponent(label)}`;
  const region = (code: CatalogRegionCode): NavDropdownItem => ({
    labelKey: CATALOG_REGIONS[code][forMovies ? "movies" : "series"],
    href: `${base}?region=${encodeURIComponent(code)}`,
  });
  return [
    { labelKey: forMovies ? "navAllMovies" : "navAllSeries", href: base },
    { labelKey: "navCatFree", href: `${base}?free=1` },
    { labelKey: "genreAction", href: genre("Action") },
    region("US"),
    { labelKey: "genreHorror", href: genre("Horror") },
    { labelKey: "navCatCartoon", href: genre("Cartoon") },
    { labelKey: "navCatLoveStory", href: genre("Love story") },
    { labelKey: forMovies ? "navKhmerMovies" : "navKhmerSeries", href: genre("Khmer") },
    region("CH"),
    region("KR"),
    region("Hindi"),
    { labelKey: forMovies ? "navJapanMovies" : "navJapanSeries", href: genre("Japan") },
    region("INDO"),
  ];
}

export const navLinks: NavLink[] = [
  { labelKey: "navHome", href: "/" },
  { labelKey: "navMovies", href: "/movies", hasCaret: true, dropdown: categoryDropdown("/movies") },
  { labelKey: "navSeries", href: "/series", hasCaret: true, dropdown: categoryDropdown("/series") },
  { labelKey: "navTv", href: "/tv" },
  { labelKey: "navShortMovies", href: "/short-movies", hasCaret: true },
  { labelKey: "navPricing", href: "/pricing" },
  { labelKey: "navMyLibrary", href: "/my-library", requiresAuth: true },
];
