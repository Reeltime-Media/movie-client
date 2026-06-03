import { clearUserSnapshot } from "@/lib/user-session";

const TOKEN_KEY = "rt_token";
const authSubscribers = new Set<() => void>();

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function notifyAuthSubscribers() {
  authSubscribers.forEach((fn) => fn());
}

export function subscribeAuth(onStoreChange: () => void) {
  authSubscribers.add(onStoreChange);
  function onStorage(e: StorageEvent) {
    if (e.key === TOKEN_KEY) onStoreChange();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    authSubscribers.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function getAuthSnapshot(): boolean {
  return Boolean(getToken());
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  notifyAuthSubscribers();
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  clearUserSnapshot();
  notifyAuthSubscribers();
}

export function isLoggedIn(): boolean {
  return getAuthSnapshot();
}
