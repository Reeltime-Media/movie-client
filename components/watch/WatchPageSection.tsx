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

/** Content band with edge padding (detail metadata, rails). */
export function WatchDetailBody({ children }: { children: ReactNode }) {
  return <div className="box-border w-full px-4 sm:px-6 md:px-8">{children}</div>;
}
