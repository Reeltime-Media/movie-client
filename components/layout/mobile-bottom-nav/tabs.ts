import { Bookmark, Clapperboard, Film, Home, Radio, Tv, User, type LucideIcon } from "lucide-react";

import type { TranslationKey } from "@/lib/i18n";

export type BottomNavTab = {
  href: string;
  labelKey: TranslationKey;
  Icon: LucideIcon;
};

/** Always-visible destinations on the phone dock (keeps width under ~390px). */
export const primaryBottomNavTabs: BottomNavTab[] = [
  { href: "/", labelKey: "navHome", Icon: Home },
  { href: "/movies", labelKey: "navMovies", Icon: Film },
  { href: "/series", labelKey: "navSeries", Icon: Tv },
  { href: "/my-library", labelKey: "navMyLibrary", Icon: Bookmark },
];

/** Secondary destinations opened from the More sheet. */
export const moreBottomNavTabs: BottomNavTab[] = [
  { href: "/tv", labelKey: "navTv", Icon: Radio },
  { href: "/short-movies", labelKey: "navShortMovies", Icon: Clapperboard },
  { href: "/profile", labelKey: "navProfile", Icon: User },
];

/** @deprecated Prefer primaryBottomNavTabs + moreBottomNavTabs. */
export const bottomNavTabs: BottomNavTab[] = [
  ...primaryBottomNavTabs,
  ...moreBottomNavTabs,
];
