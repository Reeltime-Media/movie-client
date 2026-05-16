const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const R2_PUBLIC_URL =
  (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "");

export function posterUrl(posterKey: string | null | undefined): string | undefined {
  if (!posterKey || !R2_PUBLIC_URL) return undefined;
  return `${R2_PUBLIC_URL}/${posterKey}`;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rt_token");
}

export function saveToken(token: string): void {
  localStorage.setItem("rt_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("rt_token");
}

export function isLoggedIn(): boolean {
  return Boolean(getToken());
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
