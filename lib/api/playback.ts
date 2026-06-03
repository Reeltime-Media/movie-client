import { API_URL, apiFetch } from "./client";
import { isUnauthorizedError, loginPathWithNext } from "../auth-redirect";

export interface PlaybackAuth {
  /** Master playlist path, relative to the API, carrying a scoped playback token. */
  master_url: string;
  expires_in: number;
}

/**
 * Ask the API for a tokenized HLS master URL. Requires the user to be logged in
 * and entitled (free / purchased / subscribed); the server returns 403 otherwise.
 * Returns an absolute URL ready to hand to hls.js or a <video> src.
 */
export async function getPlaybackUrl(
  contentId: string,
  loginNext?: string,
): Promise<string> {
  try {
    const auth = await apiFetch<PlaybackAuth>(`/playback/${contentId}/authorize`);
    return `${API_URL}${auth.master_url}`;
  } catch (err) {
    if (isUnauthorizedError(err) && typeof window !== "undefined") {
      const next =
        loginNext ??
        `${window.location.pathname}${window.location.search}`;
      window.location.assign(loginPathWithNext(next));
    }
    throw err;
  }
}
