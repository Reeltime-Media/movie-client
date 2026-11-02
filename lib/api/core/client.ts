export { getApiUrl, catalogCache, posterUrl, posterThumbUrl } from "./config";
export { getToken, isLoggedIn } from "@/lib/auth/token";

import { handleUnauthorizedApiResponse, isAuthEntryPath } from "@/lib/auth-redirect";
import { getApiUrl } from "./config";
import { parseApiErrorMessage } from "./errors";
import { getToken, saveToken } from "@/lib/auth/token";

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

let refreshing: Promise<boolean> | null = null;

/** Swap a token the API rejected for a new one, so a login never times out.
 * False when the login is really over; throws when the API can't say, which
 * must not sign anyone out. */
function refreshToken(expired: string): Promise<boolean> {
  if (getToken() !== expired) return Promise.resolve(Boolean(getToken()));
  refreshing ??= requestTokenRefresh(expired).finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function requestTokenRefresh(expired: string): Promise<boolean> {
  const res = await fetch(`${getApiUrl()}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${expired}` },
  });
  // 404: an API from before this route existed.
  if (res.status === 401 || res.status === 404) return false;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw Object.assign(new Error(parseApiErrorMessage(err.detail, res.statusText)), {
      status: res.status,
    });
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) return false;
  // A login or logout (here or in another tab) while this was in flight wins.
  if (getToken() !== expired) return Boolean(getToken());
  saveToken(data.access_token);
  return true;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { body, headers: extraHeaders, ...rest } = options;

  const send = (token: string | null) => {
    const headers: Record<string, string> = {
      ...(extraHeaders as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    return fetch(`${getApiUrl()}${path}`, {
      ...rest,
      credentials: "include",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  const token = getToken();
  let res = await send(token);
  if (res.status === 401 && token && !isAuthEntryPath(path) && (await refreshToken(token))) {
    res = await send(getToken());
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const error = Object.assign(
      new Error(parseApiErrorMessage(err.detail, res.statusText)),
      { status: res.status },
    );
    if (res.status === 401) {
      handleUnauthorizedApiResponse(path);
    }
    throw error;
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
  const res = await fetch(`${getApiUrl()}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw Object.assign(new Error(parseApiErrorMessage(err.detail, res.statusText)), {
      status: res.status,
    });
  }

  return res.json() as Promise<T>;
}
