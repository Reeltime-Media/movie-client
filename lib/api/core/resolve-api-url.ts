const GCP_API_HOST = "34.124.135.215";
const GCP_API_PORT = "8000";
const VERCEL_API_PROXY = "/api-proxy";

function normalizeApiUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed || trimmed.startsWith("/")) return trimmed;

  try {
    const u = new URL(trimmed);
    if (u.hostname === GCP_API_HOST && !u.port) {
      u.port = GCP_API_PORT;
    }
    return u.origin;
  } catch {
    return trimmed;
  }
}

export function resolveApiUrl(): string {
  if (typeof window !== "undefined") {
    const configured = normalizeApiUrl(
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    );
    if (window.location.protocol === "https:") {
      // Call the API directly when doing so won't trip mixed-content blocking:
      // an https:// origin, or a same-origin path. An http:// API on an https
      // page is browser-blocked, so fall back to the same-origin Vercel proxy.
      // Flipping NEXT_PUBLIC_API_URL to the HTTPS API domain removes the proxy
      // hop from every client call; until then this stays on the proxy.
      if (configured.startsWith("https://") || configured.startsWith("/")) {
        return configured;
      }
      return VERCEL_API_PROXY;
    }
    return configured;
  }

  const direct = process.env.API_PROXY_TARGET?.trim();
  if (direct) return normalizeApiUrl(direct);

  const fromPublic = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  if (fromPublic.trim().startsWith("/")) {
    return normalizeApiUrl(direct ?? "http://localhost:8000");
  }
  return normalizeApiUrl(fromPublic);
}
