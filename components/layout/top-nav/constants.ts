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
 * Category entries for the Movies/Series dropdowns. Genre hrefs rely on the
 * matching genre label being set on content in the admin (e.g. "Khmer").
 */
function categoryDropdown(base: "/movies" | "/series"): NavDropdownItem[] {
  const forMovies = base === "/movies";
  const genre = (label: string) => `${base}?genre=${encodeURIComponent(label)}`;
  return [
    { labelKey: forMovies ? "navAllMovies" : "navAllSeries", href: base },
    { labelKey: "navCatFree", href: `${base}?free=1` },
    { labelKey: "genreAction", href: genre("Action") },
    { labelKey: "navCatHollywood", href: genre("Hollywood") },
    { labelKey: "genreHorror", href: genre("Horror") },
    { labelKey: "navCatCartoon", href: genre("Cartoon") },
    { labelKey: "navCatLoveStory", href: genre("Love story") },
    { labelKey: forMovies ? "navKhmerMovies" : "navKhmerSeries", href: genre("Khmer") },
    { labelKey: forMovies ? "navChineseMovies" : "navChineseSeries", href: genre("Chinese") },
    { labelKey: forMovies ? "navKoreanMovies" : "navKoreanSeries", href: genre("Korean") },
    { labelKey: forMovies ? "navIndiaMovies" : "navIndiaSeries", href: genre("India") },
    { labelKey: forMovies ? "navJapanMovies" : "navJapanSeries", href: genre("Japan") },
    { labelKey: forMovies ? "navIndonesiaMovies" : "navIndonesiaSeries", href: genre("Indonesia") },
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
