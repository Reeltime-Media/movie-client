import { clearUserSnapshot } from "../user-session";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const R2_PUBLIC_URL =
  (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "");

/**
 * How long (seconds) Server Components may cache the public catalog before
 * revalidating. The catalog changes rarely, so a few minutes is plenty and
 * makes navigation feel instant. No effect on client-side fetches.
 */
export const CATALOG_REVALIDATE_SECONDS = 300;

/** Fetch init that enables Next.js catalog caching/ISR (server-side only). */
export const catalogCache: RequestInit = {
  next: { revalidate: CATALOG_REVALIDATE_SECONDS },
} as RequestInit;

export function posterUrl(posterKey: string | null | undefined): string | undefined {
  if (!posterKey) return undefined;
  if (/^https?:\/\//i.test(posterKey)) return posterKey;
  if (!R2_PUBLIC_URL) return undefined;
  return `${R2_PUBLIC_URL}/${posterKey.replace(/^\//, "")}`;
}

export function mediaUrl(key: string | null | undefined): string | undefined {
  if (!key || !R2_PUBLIC_URL) return undefined;
  return `${R2_PUBLIC_URL}/${key}`;
}

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

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { body, headers: extraHeaders, ...rest } = options;
  const token = getToken();

  const headers: Record<string, string> = {
    ...(extraHeaders as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw Object.assign(new Error(err.detail ?? "Request failed"), {
      status: res.status,
    });
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Login uses form-encoded body as required by FastAPI's OAuth2 form. */
export async function apiFormPost<T>(
  path: string,
  fields: Record<string, string>,
): Promise<T> {
  const body = new URLSearchParams(fields);
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw Object.assign(new Error(err.detail ?? "Request failed"), {
      status: res.status,
    });
  }

  return res.json() as Promise<T>;
}
