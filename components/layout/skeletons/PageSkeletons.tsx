import { PageShell } from "@/components/layout/PageShell";

/** A single shimmering poster tile (2:3), matching the real poster grid. */
function PosterTile() {
  return <div className="aspect-2/3 animate-pulse rounded-sm bg-surface-elevated" />;
}

/** Responsive poster grid skeleton — mirrors the catalog grid breakpoints. */
function PosterGridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <PosterTile key={i} />
      ))}
    </div>
  );
}

/** A horizontal poster rail skeleton (section header + a row of tiles). */
function RailSkeleton() {
  return (
    <section className="px-4 py-4 sm:px-6 md:px-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-5 w-0.75 shrink-0 rounded-full bg-surface-elevated" aria-hidden />
        <div className="h-4 w-40 animate-pulse rounded bg-surface-elevated" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-32 shrink-0 sm:w-36 md:w-40">
            <PosterTile />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Loading skeleton for the catalog routes (movies / series). */
export function CatalogPageSkeleton() {
  return (
    <PageShell fullWidth>
      {/* Hero header band */}
      <div className="relative ml-[calc(50%-50vw)] w-screen max-w-none shrink-0 overflow-hidden border-b border-border min-h-36 bg-surface sm:min-h-48 md:min-h-60" />

      {/* Filters row */}
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 md:px-8">
        <div className="h-9 w-40 animate-pulse rounded-md bg-surface-elevated" />
        <div className="h-9 w-28 animate-pulse rounded-md bg-surface-elevated" />
      </div>

      {/* Poster grid */}
      <div className="px-4 pb-12 sm:px-6 md:px-8">
        <PosterGridSkeleton />
      </div>
    </PageShell>
  );
}

/** Loading skeleton for the home route (hero + a couple of rails). */
export function HomePageSkeleton() {
  return (
    <PageShell fullWidth>
      {/* Hero band */}
      <div className="relative ml-[calc(50%-50vw)] w-screen max-w-none overflow-hidden border-b border-border bg-surface h-[420px] sm:h-[480px]" />

      {/* Rails */}
      <div className="mx-auto w-full max-w-6xl">
        <RailSkeleton />
        <RailSkeleton />
      </div>
    </PageShell>
  );
}
