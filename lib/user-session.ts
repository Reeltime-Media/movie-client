import type { UserRead } from "./api/types";

const USER_KEY = "rt_user";

const subscribers = new Set<() => void>();

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

export function getUserSnapshot(): UserRead | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserRead;
  } catch {
    return null;
  }
}

export function saveUserSnapshot(user: UserRead): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notify();
}

export function clearUserSnapshot(): void {
  localStorage.removeItem(USER_KEY);
  notify();
}
