import type { ReactNode } from "react";

const FULL_BLEED =
  "relative ml-[calc(50%-50vw)] w-screen max-w-[100vw] shrink-0 overflow-x-hidden";

/**
 * 16:9 frame that always fits the available viewport on every phone size.
 * Width-capped by parent; height-capped via max-width = (svh - chrome) * 16/9.
 * Uses svh (not dvh) so the frame does not jump when the mobile URL bar shows/hides.
 */
const PLAYER_FRAME =
  "relative mx-auto aspect-video w-full max-w-[min(100%,calc((100svh-8rem)*16/9))] overflow-hidden bg-black " +
  "landscape:max-w-[min(100%,calc((100svh-5.5rem)*16/9))]";

/** Cinematic full-bleed band wrapping the movie/trailer player. */
export function WatchPlayerBand({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${FULL_BLEED} box-border flex items-center justify-center border-b border-border px-3 py-3 sm:px-6 sm:py-6 lg:px-10 landscape:px-3 landscape:py-2`}
    >
      <div className={PLAYER_FRAME}>{children}</div>
    </div>
  );
}

/** Player + episode sidebar with viewport-height theater on desktop. */
export function WatchSeriesTheater({
  media,
  sidebar,
}: {
  media: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <div
      className={`${FULL_BLEED} box-border border-b border-border px-3 py-3 sm:px-6 sm:py-5 md:px-8 landscape:px-3 landscape:py-2`}
    >
      <div
        className={[
          "flex w-full flex-col overflow-hidden rounded-lg border border-border",
          // Mobile / landscape phone: natural height from the 16:9 frame — never
          // lock to 100dvh or the sidebar eats the player when the screen is short.
          // Desktop: classic theater row filling the viewport under the nav.
          "lg:h-[calc(100svh-4.5rem-2.5rem)] lg:flex-row lg:items-stretch",
        ].join(" ")}
      >
        <div className="relative min-h-0 min-w-0 w-full bg-black lg:flex-1">
          {/* Phone: sized 16:9 frame. Desktop: fill the theater pane. */}
          <div
            className={[
              PLAYER_FRAME,
              "lg:absolute lg:inset-0 lg:mx-0 lg:h-full lg:max-w-none lg:aspect-auto",
            ].join(" ")}
          >
            {media}
          </div>
        </div>
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
