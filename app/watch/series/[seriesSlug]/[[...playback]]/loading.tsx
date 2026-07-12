import { PageShell } from "@/components/layout/PageShell";
import { WatchSeriesTheater, WatchDetailBody } from "@/components/watch/WatchPageSection";

/** Skeleton matching the series watch layout so navigation shows an instant shell. */
export default function WatchSeriesLoading() {
  return (
    <PageShell fullWidth>
      <section>
        <WatchSeriesTheater
          media={<div className="h-full w-full animate-pulse bg-surface-elevated" />}
          sidebar={
            <div className="flex h-full flex-col">
              <div className="border-b border-border px-4 py-3">
                <div className="h-4 w-24 animate-pulse rounded bg-surface-elevated" />
              </div>
              <div className="flex-1 divide-y divide-border overflow-hidden">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="h-8 w-8 shrink-0 animate-pulse rounded-md bg-surface-elevated" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-surface-elevated" />
                      <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-elevated" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        />

        <WatchDetailBody>
          <div className="mt-6 space-y-3 pb-8">
            <div className="h-6 w-2/3 max-w-md animate-pulse rounded bg-surface-elevated md:h-7" />
            <div className="h-3 w-full max-w-3xl animate-pulse rounded bg-surface-elevated" />
            <div className="h-3 w-5/6 max-w-3xl animate-pulse rounded bg-surface-elevated" />
          </div>
        </WatchDetailBody>
      </section>
    </PageShell>
  );
}
