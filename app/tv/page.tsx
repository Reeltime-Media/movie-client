import { TvView } from "@/components/tv/TvView";
import { listTvChannels } from "@/lib/api/tv";
import { swallow } from "@/lib/log";

// Not cached/ISR like the movie/series catalog — channel `status` (live vs
// offline) needs to stay fresh on every load.
export default async function TvPage() {
  const channels = await listTvChannels().catch(swallow("tv: load channels", []));

  return <TvView channels={channels} />;
}
