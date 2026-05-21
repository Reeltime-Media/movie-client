const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const R2_PUBLIC_URL =
  (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "");

export function posterUrl(posterKey: string | null | undefined): string | undefined {
  if (!posterKey || !R2_PUBLIC_URL) return undefined;
  return `${R2_PUBLIC_URL}/${posterKey}`;
}

export function mediaUrl(key: string | null | undefined): string | undefined {
  if (!key || !R2_PUBLIC_URL) return undefined;
  return `${R2_PUBLIC_URL}/${key}`;
}

const TOKEN_KEY = "rt_token";
const authSubscribers = new Set<() => void>();

function getToken(): string | null {
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
