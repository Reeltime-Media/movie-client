import { apiFetch, apiFormPost, saveToken } from "./client";
import type { TokenResponse, UserRead } from "./types";

export async function login(email: string, password: string): Promise<void> {
  const data = await apiFormPost<TokenResponse>("/auth/login", { email, password });
  saveToken(data.access_token);
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

export async function updateMe(data: { full_name?: string; password?: string }): Promise<UserRead> {
  return apiFetch<UserRead>("/users/me", { method: "PATCH", body: data });
}
