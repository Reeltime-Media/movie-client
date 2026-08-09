import { TvView } from "@/components/tv/TvView";
import { listTvChannels } from "@/lib/api/tv";
import { swallow } from "@/lib/log";

// Not cached/ISR like the movie/series catalog — channel `status` (live vs
// offline) needs to stay fresh on every load. Without an explicit dynamic
// export, Next fully prerenders this route at build time and serves that
// frozen snapshot from the edge cache indefinitely (verified in prod: HTML
// served with `x-vercel-cache: HIT`, `age` in the tens of thousands of
// seconds), so the uncached `fetch` below never actually re-runs.
export const dynamic = "force-dynamic";

export default async function TvPage() {
  const channels = await listTvChannels().catch(swallow("tv: load channels", []));

  return <TvView channels={channels} />;
}
