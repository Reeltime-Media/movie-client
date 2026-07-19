import type { ReactNode } from "react";
import { WatchPlayerFrame } from "@/components/watch/WatchPlayerFrame";

/** Cinematic band wrapping the movie/trailer player. */
export function WatchPlayerBand({ children }: { children: ReactNode }) {
  return (
    <div className="box-border flex w-full items-center justify-center border-b border-border px-0 py-0 sm:px-6 sm:py-5 lg:px-10">
      <WatchPlayerFrame>{children}</WatchPlayerFrame>
    </div>
  );
}

/** Player + episode sidebar — natural 16:9 on phone, theater row on desktop. */
export function WatchSeriesTheater({
  media,
  sidebar,
}: {
  media: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <div className="box-border w-full border-b border-border px-0 py-0 sm:px-6 sm:py-5 md:px-8">
      <div className="watch-series-theater flex w-full flex-col overflow-hidden sm:rounded-lg sm:border sm:border-border">
        <div className="relative min-h-0 min-w-0 w-full bg-black lg:flex-1">
          <WatchPlayerFrame theater>{media}</WatchPlayerFrame>
        </div>
        <div className="flex max-h-[min(42vh,360px)] w-full min-h-0 flex-col border-t border-border bg-surface lg:max-h-none lg:w-[min(100%,360px)] lg:shrink-0 lg:border-t-0 lg:border-l">
          {sidebar}
        </div>
      </div>
    </div>
  );
}

/** Content band with edge padding (detail metadata, rails). */
export function WatchDetailBody({ children }: { children: ReactNode }) {
  return <div className="box-border w-full px-4 sm:px-6 md:px-8">{children}</div>;
}
