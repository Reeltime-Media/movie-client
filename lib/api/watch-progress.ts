import { apiFetch } from "./client";
import type { WatchProgressRead } from "./types";

export function listWatchProgress(): Promise<WatchProgressRead[]> {
  return apiFetch<WatchProgressRead[]>("/watch-progress/");
}
