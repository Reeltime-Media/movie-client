import type { ReactNode } from "react";

const FULL_BLEED =
  "relative ml-[calc(50%-50vw)] w-screen max-w-[100vw] shrink-0 overflow-x-hidden";

/** Player + episode sidebar with viewport-height theater and side/top gutters. */
export function WatchSeriesTheater({
  media,
  sidebar,
}: {
  media: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <div className={`${FULL_BLEED} box-border border-b border-border px-4 py-4 sm:px-6 sm:py-5 md:px-8`}>
      <div className="flex h-[calc(100dvh-4.5rem-2rem)] w-full flex-col overflow-hidden rounded-lg border border-border sm:h-[calc(100dvh-4.5rem-2.5rem)] lg:flex-row lg:items-stretch">
        <div className="relative min-h-0 min-w-0 flex-1 bg-black">{media}</div>
        <div className="flex max-h-[min(42vh,360px)] w-full min-h-0 flex-col border-t border-border bg-surface lg:max-h-none lg:w-[min(100%,360px)] lg:shrink-0 lg:border-t-0 lg:border-l">
          {sidebar}
        </div>
      </div>
    </div>
  );
}

/** Full-viewport content band with edge padding (detail metadata, rails). */
export function WatchDetailBody({ children }: { children: ReactNode }) {
  return (
    <div className={`${FULL_BLEED} box-border px-4 sm:px-6 md:px-8`}>
      {children}
    </div>
  );
}
