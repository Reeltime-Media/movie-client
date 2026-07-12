import { clearToken } from "@/lib/auth/token";

let redirectingToLogin = false;

/** Paths where 401 is expected and should stay on the page (e.g. bad login credentials). */
function isAuthEntryPath(path: string): boolean {
  const base = path.split("?")[0] ?? path;
  return base.startsWith("/auth/");
}

export function loginPathWithNext(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}

function currentPathForLoginRedirect(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

/** Clear session and send the user to login, preserving return URL. */
function redirectToLogin(next?: string): void {
  if (typeof window === "undefined" || redirectingToLogin) return;
  redirectingToLogin = true;
  clearToken();
  window.location.assign(loginPathWithNext(next ?? currentPathForLoginRedirect()));
}

export function handleUnauthorizedApiResponse(path: string): void {
  if (isAuthEntryPath(path)) return;
  redirectToLogin();
}
