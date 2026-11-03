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

/**
 * The title without the Khmer name it already contains: imported episodes are
 * titled "Domnak Akum EP65 — <Khmer>", which would show the Khmer name twice.
 * Null when nothing but the Khmer name is left.
 */
function englishPart(title: string, km: string): string | null {
  const at = title.indexOf(km);
  if (at < 0) return title;
  const rest = (title.slice(0, at) + title.slice(at + km.length)).replace(/^[\s—–-]+|[\s—–-]+$/g, "");
  return rest || null;
}

/** Episode name for the viewer's language, plus the other language as a subtitle. */
export function podcastTitles(
  podcast: { title: string; title_km?: string | null },
  locale: Locale,
): { primary: string; secondary: string | null } {
  const km = podcast.title_km?.trim() || null;
  if (!km) return { primary: podcast.title, secondary: null };
  const english = englishPart(podcast.title, km);
  if (!english) return { primary: km, secondary: null };
  return locale === "km" ? { primary: km, secondary: english } : { primary: english, secondary: km };
}
