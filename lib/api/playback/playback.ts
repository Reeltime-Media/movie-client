import { apiFetch, getApiUrl } from "../core/client";

interface PlaybackAuth {
  /** Master playlist path, relative to the API, carrying a scoped playback token. */
  master_url: string;
  expires_in: number;
}

/**
 * Ask the API for a tokenized HLS master URL. Requires the user to be logged in
 * and entitled (free / purchased / subscribed); the server returns 403 otherwise.
 * Returns an absolute URL ready to hand to hls.js or a <video> src.
 */
export async function getPlaybackUrl(contentId: string): Promise<string> {
  const auth = await apiFetch<PlaybackAuth>(`/playback/${contentId}/authorize`);
  return `${getApiUrl()}${auth.master_url}`;
}
