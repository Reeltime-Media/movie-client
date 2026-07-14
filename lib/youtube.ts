function youtubeId(url: string | null | undefined): string | null {
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

/** Hero-specific embed: muted autoplay, no controls/branding, on the privacy-enhanced domain. */
export function youtubeHeroEmbedUrl(url: string | null | undefined): string | null {
  const id = youtubeId(url);
  if (!id) return null;
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    playsinline: "1",
    modestbranding: "1",
    rel: "0",
    enablejsapi: "1",
    // Suppress every piece of player chrome YouTube lets us: keyboard,
    // fullscreen button, annotations, captions.
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
    cc_load_policy: "0",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}
