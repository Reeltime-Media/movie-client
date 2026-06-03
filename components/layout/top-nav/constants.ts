import type { TranslationKey } from "@/lib/i18n";

export type NavLink = {
  labelKey: TranslationKey;
  href: string;
  requiresAuth?: boolean;
};

export const navLinks: NavLink[] = [
  { labelKey: "navHome", href: "/" },
  { labelKey: "navMovies", href: "/movies" },
  { labelKey: "navSeries", href: "/series" },
  { labelKey: "navPricing", href: "/pricing" },
  { labelKey: "navMyLibrary", href: "/my-library", requiresAuth: true },
];
