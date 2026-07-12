"use client";

import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { BannerCard, type BannerCardProps } from "@/components/catalog/BannerCard";

export function BannerScrollRail({
  cards,
  imagePriorityCount = 0,
  className,
  autoScroll = false,
  speed = 0.5,
  direction = "left",
}: {
  cards: readonly BannerCardProps[];
  imagePriorityCount?: number;
  className?: string;
  autoScroll?: boolean;
  speed?: number;
  direction?: "left" | "right";
}) {
  const scrollRef = useAutoScroll(autoScroll ? speed : 0, 2000, direction);

  if (!cards.length) return null;

  const items = autoScroll ? [...cards, ...cards] : cards;

  return (
    <div
      ref={scrollRef}
      className={[
        "mt-3 overflow-x-auto overflow-y-visible pb-2 pt-0.5 px-4 sm:px-6 md:px-8",
        autoScroll ? "rt-scroll-rail" : "",
        className ?? "",
      ].join(" ")}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <ul className="m-0 flex w-max list-none flex-row gap-3 p-0 snap-x snap-mandatory">
        {items.map((card, i) => (
          <li
            key={`${card.watchHref ?? "no-href"}-${i}`}
            className="w-[min(320px,80vw)] shrink-0 snap-start sm:w-85 md:w-95"
            aria-hidden={autoScroll && i >= cards.length ? true : undefined}
          >
            <BannerCard {...card} imagePriority={i < imagePriorityCount} />
          </li>
        ))}
      </ul>
    </div>
  );
}
