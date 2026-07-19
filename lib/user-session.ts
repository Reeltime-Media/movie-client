import type { UserRead } from "@/lib/api/types";

const USER_KEY = "rt_user";

const subscribers = new Set<() => void>();

/** Cached so useSyncExternalStore gets a stable reference when data is unchanged. */
let cachedRaw: string | null | undefined;
let cachedUser: UserRead | null = null;

function notify() {
  subscribers.forEach((fn) => fn());
}

export function subscribeUser(onStoreChange: () => void) {
  subscribers.add(onStoreChange);
  function onStorage(e: StorageEvent) {
    if (e.key === USER_KEY) onStoreChange();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    subscribers.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getServerUserSnapshot(): null {
  return null;
}

export function getUserSnapshot(): UserRead | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (raw === cachedRaw) return cachedUser;
  cachedRaw = raw;
  if (!raw) {
    cachedUser = null;
    return null;
  }
  try {
    cachedUser = JSON.parse(raw) as UserRead;
    return cachedUser;
  } catch {
    cachedUser = null;
    return null;
  }
}

export function saveUserSnapshot(user: UserRead): void {
  const raw = JSON.stringify(user);
  cachedRaw = raw;
  cachedUser = user;
  localStorage.setItem(USER_KEY, raw);
  notify();
}

export function clearUserSnapshot(): void {
  cachedRaw = null;
  cachedUser = null;
  localStorage.removeItem(USER_KEY);
  notify();
}
