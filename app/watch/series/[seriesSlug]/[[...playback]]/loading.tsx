import { PageShell } from "@/components/layout/PageShell";
import { WatchDetailBody, WatchPlayerBand } from "@/components/watch/WatchPageSection";

/** Skeleton matching the series watch layout so navigation shows an instant shell. */
export default function WatchSeriesLoading() {
  return (
    <PageShell fullWidth>
      <WatchPlayerBand>
        <div className="absolute inset-0 animate-pulse bg-surface-elevated" />
      </WatchPlayerBand>

      <section className="border-b border-border py-6 md:py-8">
        <WatchDetailBody>
          <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:gap-6">
            <div className="aspect-2/3 w-[140px] shrink-0 animate-pulse rounded-md bg-surface-elevated sm:w-[160px]" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-6 w-2/3 max-w-md animate-pulse rounded bg-surface-elevated md:h-7" />
              <div className="h-4 w-1/3 max-w-xs animate-pulse rounded bg-surface-elevated" />
              <div className="h-3 w-full max-w-3xl animate-pulse rounded bg-surface-elevated" />
              <div className="h-3 w-5/6 max-w-3xl animate-pulse rounded bg-surface-elevated" />
            </div>
          </div>
        </WatchDetailBody>
      </section>

      <section className="border-b border-border py-6 md:py-8">
        <WatchDetailBody>
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 h-10 w-45 animate-pulse rounded bg-surface-elevated" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-md bg-surface-elevated" />
              ))}
            </div>
          </div>
        </WatchDetailBody>
      </section>
    </PageShell>
  );
}
