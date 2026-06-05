export function cspConnectSrc(): string {
  const parts = ["'self'", "https:", "http://localhost:*", "http://127.0.0.1:*"];
  const seen = new Set(parts);

  const add = (raw: string | undefined) => {
    const v = raw?.trim().replace(/\/$/, "");
    if (!v || v.startsWith("/")) return;
    if ((v.startsWith("http://") || v.startsWith("https://")) && !seen.has(v)) {
      seen.add(v);
      parts.push(v);
    }
  };

  add(process.env.NEXT_PUBLIC_API_URL);
  add(process.env.API_PROXY_TARGET);
  add(process.env.MOVIE_API_ORIGIN ?? "http://34.124.135.215:8000");
  add("http://34.124.135.215");
  add("http://34.124.135.215:8000");

  return parts.join(" ");
}
