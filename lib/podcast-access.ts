import type { Locale } from "@/lib/i18n";

export type PodcastLockReason = "signin" | "subscribe";

type PodcastViewer = {
  isFree: boolean;
  loggedIn: boolean;
  hasSubscription: boolean;
  isAdmin: boolean;
};

/**
 * Why a viewer can't play a podcast, or null when they can. Mirrors movie-api's
 * `can_access_content` for podcasts: admins, free episodes, or any active
 * subscription plan — there is no à-la-carte purchase. The API stays the
 * authority; this only decides which badge and prompt the page shows.
 */
export function podcastLockReason(viewer: PodcastViewer): PodcastLockReason | null {
  if (viewer.isAdmin || viewer.isFree) return null;
  if (!viewer.loggedIn) return "signin";
  return viewer.hasSubscription ? null : "subscribe";
}

/** Episode name for the viewer's language, plus the other language as a subtitle. */
export function podcastTitles(
  podcast: { title: string; title_km?: string | null },
  locale: Locale,
): { primary: string; secondary: string | null } {
  const km = podcast.title_km?.trim() || null;
  if (locale === "km" && km) return { primary: km, secondary: podcast.title };
  return { primary: podcast.title, secondary: km };
}
