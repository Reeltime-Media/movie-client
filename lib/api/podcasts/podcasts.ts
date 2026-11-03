import { apiFetch } from "../core/client";
import { fetchAllPages } from "../core/pagination";
import type { ContentListItemRead, PodcastAudioAuthorizeRead } from "../types";

/**
 * Published podcast episodes, newest first (the API orders by creation time).
 * Anyone can see the list; playing needs a free episode or an active plan.
 */
export function listPodcasts(init?: RequestInit): Promise<ContentListItemRead[]> {
  return fetchAllPages<ContentListItemRead>("/podcasts", 100, init);
}

/**
 * Asks the API for a playable audio URL. Throws with `status` 403 when the
 * viewer isn't entitled (free episode, active subscription or admin) and 409
 * when the episode has no audio yet.
 */
export async function authorizePodcastAudio(podcastId: string): Promise<string> {
  const auth = await apiFetch<PodcastAudioAuthorizeRead>(`/podcasts/${podcastId}/audio`);
  const url = auth.audio_url?.trim() ?? "";
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error("The podcast audio URL is not valid");
  }
  return url;
}
