import { Suspense } from "react";
import { PodcastPageSkeleton } from "@/components/layout/skeletons/PageSkeletons";
import { PodcastView } from "@/components/podcast/PodcastView";
import { listPodcasts } from "@/lib/api/podcasts";
import { swallow } from "@/lib/log";

// Always fresh: new episodes are added in the admin at any time, and a
// prerendered copy would otherwise be served until the next build.
export const dynamic = "force-dynamic";

export default async function PodcastsPage() {
  const podcasts = await listPodcasts({ cache: "no-store" }).catch(
    swallow("podcasts: load episodes", []),
  );

  return (
    <Suspense fallback={<PodcastPageSkeleton />}>
      <PodcastView podcasts={podcasts} />
    </Suspense>
  );
}
