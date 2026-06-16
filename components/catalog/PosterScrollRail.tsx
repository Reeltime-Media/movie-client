"use client";

import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { PosterCard } from "@/components/catalog/PosterCard";
import type { PosterCardProps } from "@/types/poster-card";

const GUTTER = {
  sm: "px-4 md:px-8",
  md: "-mx-6 px-6 md:-mx-8 md:px-8",
} as const;

export function PosterScrollRail({
  posters,
  imagePriorityCount = 0,
  gutter = "md",
  className,
  autoScroll = false,
  speed = 0.6,
  direction = "left",
}: {
  posters: readonly PosterCardProps[];
  imagePriorityCount?: number;
  gutter?: keyof typeof GUTTER;
  className?: string;
  autoScroll?: boolean;
  speed?: number;
  direction?: "left" | "right";
}) {
  const scrollRef = useAutoScroll(autoScroll ? speed : 0, 2000, direction);

  if (!posters.length) return null;

  const items = autoScroll ? [...posters, ...posters] : posters;

  return (
    <div
      ref={scrollRef}
      className={[
        "mt-4 overflow-x-auto overflow-y-visible pb-2 pt-0.5",
        autoScroll ? "rt-scroll-rail" : "",
        GUTTER[gutter],
        className ?? "",
      ].join(" ")}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <ul className="m-0 flex w-max list-none flex-row gap-3 p-0 snap-x snap-mandatory">
        {items.map((poster, i) => (
          <li
            key={`${poster.watchHref ?? "no-href"}-${i}`}
            className="w-[min(200px,42vw)] shrink-0 snap-start sm:w-50 md:w-55"
            aria-hidden={autoScroll && i >= posters.length ? true : undefined}
          >
            <PosterCard {...poster} imagePriority={i < imagePriorityCount} />
          </li>
        ))}
      </ul>
    </div>
  );
}
