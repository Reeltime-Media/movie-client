import type { TranslationKey } from "@/lib/i18n";

export type NavLink = {
  labelKey: TranslationKey;
  href: string;
  requiresAuth?: boolean;
  /** Shows a small dropdown-style chevron next to the label (decorative). */
  hasCaret?: boolean;
};

export const navLinks: NavLink[] = [
  { labelKey: "navHome", href: "/" },
  { labelKey: "navMovies", href: "/movies", hasCaret: true },
  { labelKey: "navSeries", href: "/series", hasCaret: true },
  { labelKey: "navShortMovies", href: "/short-movies", hasCaret: true },
  { labelKey: "navPricing", href: "/pricing" },
  { labelKey: "navMyLibrary", href: "/my-library", requiresAuth: true },
];
