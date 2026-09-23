import { apiFetch, getApiUrl } from "../core/client";
import type { TvChannelAuthorizeRead, TvChannelRead } from "../types";

const _authCache = new Map<string, { url: string; expiresAt: number }>();

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
  const cached = _authCache.get(channelId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }
  const auth = await apiFetch<TvChannelAuthorizeRead>(
    `/tv/channels/${channelId}/authorize`,
  );
  const master = auth.master_url?.trim() ?? "";
  const url =
    master.startsWith("http://") || master.startsWith("https://")
      ? master
      : `${getApiUrl()}${master.startsWith("/") ? master : `/${master}`}`;
  const expiresIn = auth.expires_in ?? 3600;
  const ttlSeconds = Math.min(
    3600,
    Math.max(30, expiresIn > 120 ? expiresIn - 60 : expiresIn),
  );
  _authCache.set(channelId, { url, expiresAt: Date.now() + ttlSeconds * 1000 });
  return url;
}

/** Warm authorize for the first live channels the user can open. */
export function prefetchTvChannels(
  channels: TvChannelRead[],
  isEntitled: (channel: TvChannelRead) => boolean,
  limit = 6,
): void {
  let n = 0;
  for (const channel of channels) {
    if (channel.status !== "live" || !isEntitled(channel)) continue;
    void authorizeTvChannel(channel.id).catch(() => undefined);
    n += 1;
    if (n >= limit) return;
  }
}
