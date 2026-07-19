import { saveToken } from "@/lib/auth/token";
import { apiFetch, apiFormPost } from "../core/client";
import type { TokenResponse, UserRead } from "../types";
import { saveUserSnapshot } from "@/lib/user-session";

export async function refreshUserSession(): Promise<UserRead> {
  const user = await getMe();
  saveUserSnapshot(user);
  return user;
}

export async function login(email: string, password: string): Promise<void> {
  const data = await apiFormPost<TokenResponse>("/auth/login", { email, password });
  saveToken(data.access_token);
  await refreshUserSession();
}

export async function loginWithGoogle(idToken: string): Promise<void> {
  const data = await apiFetch<TokenResponse>("/auth/google", {
    method: "POST",
    body: { id_token: idToken },
  });
  saveToken(data.access_token);
  await refreshUserSession();
}

export async function register(
  email: string,
  password: string,
  fullName?: string,
): Promise<UserRead> {
  return apiFetch<UserRead>("/auth/register", {
    method: "POST",
    body: { email, password, full_name: fullName ?? null },
  });
}

export async function getMe(): Promise<UserRead> {
  return apiFetch<UserRead>("/users/me");
}

/** Always resolves regardless of whether the email matches an account — the
 * API intentionally doesn't reveal account existence. */
export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch<void>("/auth/forgot-password", { method: "POST", body: { email } });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiFetch<void>("/auth/reset-password", {
    method: "POST",
    body: { token, password },
  });
}

export async function updateMe(data: {
  full_name?: string;
  password?: string;
}): Promise<UserRead> {
  const user = await apiFetch<UserRead>("/users/me", { method: "PATCH", body: data });
  saveUserSnapshot(user);
  return user;
}
