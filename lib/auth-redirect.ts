/** True when apiFetch rejected with HTTP 401. */
export function isUnauthorizedError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as { status: number }).status === 401
  );
}

export function loginPathWithNext(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}
