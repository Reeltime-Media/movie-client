import { Bookmark, Clapperboard, Film, Home, Radio, Tv, User, type LucideIcon } from "lucide-react";

import type { TranslationKey } from "@/lib/i18n";

export type BottomNavTab = {
  href: string;
  labelKey: TranslationKey;
  Icon: LucideIcon;
};

/** Primary tabs for the mobile bottom bar (matches top-nav catalog links). */
export const bottomNavTabs: BottomNavTab[] = [
  { href: "/", labelKey: "navHome", Icon: Home },
  { href: "/movies", labelKey: "navMovies", Icon: Film },
  { href: "/series", labelKey: "navSeries", Icon: Tv },
  { href: "/tv", labelKey: "navTv", Icon: Radio },
  { href: "/short-movies", labelKey: "navShortMovies", Icon: Clapperboard },
  { href: "/my-library", labelKey: "navMyLibrary", Icon: Bookmark },
  { href: "/profile", labelKey: "navProfile", Icon: User },
];
