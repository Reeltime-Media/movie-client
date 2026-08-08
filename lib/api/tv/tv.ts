import { apiFetch, getApiUrl } from "../core/client";
import type { TvChannelAuthorizeRead, TvChannelRead } from "../types";

/**
 * Public channel list — never cached client-side (unlike movies/series)
 * because `status` ("live" / "offline") needs to stay fresh, not sit behind
 * a multi-minute catalog TTL.
 */
export function listTvChannels(): Promise<TvChannelRead[]> {
  return apiFetch<TvChannelRead[]>("/tv/channels");
}

/**
 * Requests a tokenized live playlist URL for the channel. Free channels
 * authorize for anyone, logged in or not. Paid channels require login and an
 * active subscription — throws (status 403) when the caller isn't entitled,
 * or (status 409) when the channel isn't currently live.
 */
export async function authorizeTvChannel(channelId: string): Promise<string> {
  const auth = await apiFetch<TvChannelAuthorizeRead>(
    `/tv/channels/${channelId}/authorize`,
  );
  return `${getApiUrl()}${auth.master_url}`;
}
