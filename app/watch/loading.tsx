import { PageShell } from "@/components/layout/PageShell";
import { WatchDetailBody, WatchPlayerBand } from "@/components/watch/WatchPageSection";

/** Skeleton matching the movie watch layout so navigation shows an instant shell. */
export default function WatchLoading() {
  return (
    <PageShell fullWidth>
      <WatchPlayerBand>
        <div className="absolute inset-0 animate-pulse bg-surface-elevated" />
      </WatchPlayerBand>

      <section className="relative border-b border-border py-6 md:py-8">
        <WatchDetailBody>
          <div className="mx-auto max-w-6xl">
            <div className="flex items-start gap-8">
              <div className="min-w-0 flex-1 space-y-4">
                <div className="h-7 w-2/3 max-w-md animate-pulse rounded bg-surface-elevated" />
                <div className="h-3 w-full max-w-3xl animate-pulse rounded bg-surface-elevated" />
                <div className="h-3 w-5/6 max-w-3xl animate-pulse rounded bg-surface-elevated" />
                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-6 w-20 animate-pulse rounded-md bg-surface-elevated" />
                  ))}
                </div>
              </div>
              <div className="hidden aspect-[2/3] w-[110px] shrink-0 animate-pulse bg-surface-elevated md:block" />
            </div>
          </div>
        </WatchDetailBody>
      </section>
    </PageShell>
  );
}
