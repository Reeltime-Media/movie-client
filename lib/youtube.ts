export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0] ?? null;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const embed = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embed) return embed[1] ?? null;
    }
  } catch {}
  return null;
}

export function youtubeEmbedUrl(
  url: string | null | undefined,
  opts?: { autoplay?: boolean },
): string | null {
  const id = youtubeId(url);
  if (!id) return null;
  const params = new URLSearchParams({ rel: "0" });
  if (opts?.autoplay) params.set("autoplay", "1");
  return `https://www.youtube.com/embed/${id}?${params}`;
}
