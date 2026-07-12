import type { ReactNode } from "react";

const FULL_BLEED =
  "relative ml-[calc(50%-50vw)] w-screen max-w-[100vw] shrink-0 overflow-x-hidden";

/** Full-bleed block inside a watch/detail page (player, locked preview). */
export function WatchMediaBleed({ children }: { children: ReactNode }) {
  return <div className={FULL_BLEED}>{children}</div>;
}

/** Centered movie player with comfortable side margins (single-movie watch). */
export function WatchMovieTheater({ children }: { children: ReactNode }) {
  return (
    <section className="border-b border-border py-5 md:py-8">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8">
        <div className="overflow-hidden rounded-lg border border-border bg-black">
          {children}
        </div>
      </div>
    </section>
  );
}

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
