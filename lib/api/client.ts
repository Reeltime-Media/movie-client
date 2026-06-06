export { API_URL, R2_PUBLIC_URL, CATALOG_REVALIDATE_SECONDS, catalogCache, posterUrl, mediaUrl } from "./config";
export {
  clearToken,
  getAuthSnapshot,
  getToken,
  isLoggedIn,
  saveToken,
  subscribeAuth,
} from "@/lib/auth/token";

import { handleUnauthorizedApiResponse } from "@/lib/auth-redirect";
import { API_URL } from "./config";
import { parseApiErrorMessage } from "./errors";
import { getToken } from "@/lib/auth/token";

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
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
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
