const ALLOWED_PATH_PREFIXES = [
  "/",
  "/watch",
  "/movies",
  "/series",
  "/my-library",
  "/pricing",
  "/pay",
  "/profile",
  "/payment/success",
  "/link-device",
] as const;

/** Only allow same-site relative redirects after payment or login. */
export function safeRedirectPath(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return fallback;
  }
  const pathOnly = trimmed.split("?")[0]?.split("#")[0] ?? trimmed;
  const allowed = ALLOWED_PATH_PREFIXES.some(
    (prefix) => pathOnly === prefix || pathOnly.startsWith(`${prefix}/`),
  );
  return allowed ? trimmed : fallback;
}

const BARAY_CHECKOUT_HOSTS = ["pay.baray.io", "checkout.baray.io"];

export function safeCheckoutUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("Invalid checkout URL");
    }
    if (!BARAY_CHECKOUT_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))) {
      throw new Error("Checkout host is not allowed");
    }
    return url;
  } catch {
    throw new Error("Invalid checkout URL from payment provider");
  }
}
