import { apiFetch, getToken, isLoggedIn } from "./client";
import type { WatchProgressRead } from "./types";

export type WatchProgressUpdate = {
  position_seconds: number;
  completed: boolean;
};

export function listWatchProgress(): Promise<WatchProgressRead[]> {
  return apiFetch<WatchProgressRead[]>("/watch-progress/");
}

export function upsertWatchProgress(
  contentId: string,
  data: WatchProgressUpdate,
  options?: { keepalive?: boolean },
): Promise<WatchProgressRead | void> {
  if (!isLoggedIn()) return Promise.resolve();

  const url = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/watch-progress/${contentId}`;
  const token = getToken();

  if (options?.keepalive && typeof fetch !== "undefined") {
    return fetch(url, {
      method: "PUT",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        position_seconds: data.position_seconds,
        completed: data.completed,
      }),
    }).then(() => undefined);
  }

  return apiFetch<WatchProgressRead>(`/watch-progress/${contentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      position_seconds: data.position_seconds,
      completed: data.completed,
    }),
  });
}
