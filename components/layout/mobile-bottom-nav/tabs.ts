import { Bookmark, Film, Home, Tv, User, type LucideIcon } from "lucide-react";

import type { TranslationKey } from "@/lib/i18n";

export type BottomNavTab = {
  href: string;
  labelKey: TranslationKey;
  Icon: LucideIcon;
};

/** Fixed five-tab layout for the mobile bottom bar. */
export const bottomNavTabs: BottomNavTab[] = [
  { href: "/", labelKey: "navHome", Icon: Home },
  { href: "/movies", labelKey: "navMovies", Icon: Film },
  { href: "/series", labelKey: "navSeries", Icon: Tv },
  { href: "/my-library", labelKey: "navMyLibrary", Icon: Bookmark },
  { href: "/profile", labelKey: "navProfile", Icon: User },
];
