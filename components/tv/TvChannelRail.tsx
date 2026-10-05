"use client";

import type { RefObject } from "react";
import { useRouter } from "next/navigation";
import { TvChannelCard } from "@/components/tv/TvChannelCard";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import type { TvChannelRead } from "@/lib/api/types";
import { tvChannelHref } from "@/lib/movie-routes";

/**
 * Horizontal teaser rail of TV channel tiles for the home page. Selecting a
 * channel opens `/tv` with that channel pre-selected, where playback,
 * entitlement and offline handling already live.
 */
export function TvChannelRail({
  channels,
  isEntitled,
  scrollRef: externalRef,
}: {
  channels: readonly TvChannelRead[];
  isEntitled: (channel: TvChannelRead) => boolean;
  /** Exposes the scroll container so a SectionHeader can drive prev/next arrows. */
  scrollRef?: RefObject<HTMLDivElement | null>;
}) {
  const router = useRouter();
  const dragScrollRef = useDragScroll();
  const scrollRef = (node: HTMLDivElement | null) => {
    dragScrollRef.current = node;
    if (externalRef) externalRef.current = node;
  };

  if (!channels.length) return null;

  return (
    <div
      ref={scrollRef}
      className="mt-4 overflow-x-auto overflow-y-visible px-4 pb-2 pt-0.5 rt-scroll-rail rt-drag-rail sm:px-6 md:px-8"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <ul className="m-0 flex w-max list-none flex-row gap-3 p-0 snap-x snap-mandatory">
        {channels.map((channel) => (
          <li key={channel.id} className="w-[min(200px,42vw)] shrink-0 snap-start sm:w-50 md:w-55">
            <TvChannelCard
              channel={channel}
              isEntitled={isEntitled(channel)}
              isSelected={false}
              isLoading={false}
              onSelect={(c) => router.push(tvChannelHref(c.slug))}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
