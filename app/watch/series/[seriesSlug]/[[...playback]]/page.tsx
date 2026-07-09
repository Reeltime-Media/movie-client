import { redirect } from "next/navigation";
import { WatchSeriesClient } from "@/components/watch/WatchSeriesClient";
import { getSeries, listEpisodes } from "@/lib/api/series";

export const revalidate = 300;

type WatchSeriesPageProps = {
  params: Promise<{ seriesSlug: string; playback?: string[] }>;
};

export default async function WatchSeriesPlaybackPage({ params }: WatchSeriesPageProps) {
  const { seriesSlug, playback = [] } = await params;

  // Default to S1 E1 so the client never has to bounce through a blank state.
  if (playback.length === 0) {
    redirect(`/watch/series/${seriesSlug}/1/1`);
  }

  // Public catalog data — fetched (and cached, via `revalidate`) on the server so
  // the shell, episode list and metadata paint immediately. Entitlement and the
  // tokenized stream URL still resolve client-side (they need the auth token).
  const [series, seasons] = await Promise.all([
    getSeries(seriesSlug).catch(() => null),
    listEpisodes(seriesSlug).catch(() => [] as Awaited<ReturnType<typeof listEpisodes>>),
  ]);

  return (
    <WatchSeriesClient
      seriesSlug={seriesSlug}
      playback={playback}
      initialSeries={series}
      initialSeasons={seasons}
    />
  );
}
