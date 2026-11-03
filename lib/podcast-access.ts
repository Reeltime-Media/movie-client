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

/**
 * How an episode is named in lists and the player: the Khmer episode name is
 * the headline (the podcast is in Khmer), with the series and number
 * ("Domnak Akum EP65") as a small label above it. Without a Khmer name the
 * English title is the headline.
 */
export function podcastHeadline(podcast: { title: string; title_km?: string | null }): {
  eyebrow: string | null;
  title: string;
} {
  const km = podcast.title_km?.trim() || null;
  if (!km) return { eyebrow: null, title: podcast.title };
  return { eyebrow: englishPart(podcast.title, km), title: km };
}

/** `m:ss`, or `h:mm:ss` from an hour up; "0:00" for anything unusable. */
export function formatPodcastClock(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}
