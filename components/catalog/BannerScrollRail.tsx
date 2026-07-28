"use client";

import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useDragScroll } from "@/hooks/use-drag-scroll";
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
  const autoScrollRef = useAutoScroll(autoScroll ? speed : 0, 2000, direction);
  const dragScrollRef = useDragScroll();
  const scrollRef = (node: HTMLDivElement | null) => {
    autoScrollRef.current = node;
    dragScrollRef.current = node;
  };

  if (!cards.length) return null;

  const items = autoScroll ? [...cards, ...cards] : cards;

  return (
    <div
      ref={scrollRef}
      className={[
        "mt-3 overflow-x-auto overflow-y-visible pb-2 pt-0.5 px-4 sm:px-6 md:px-8 rt-scroll-rail rt-drag-rail",
        className ?? "",
      ].join(" ")}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <ul className="m-0 flex w-max list-none flex-row gap-3 p-0 snap-x snap-mandatory">
        {items.map((card, i) => {
          const isClone = autoScroll && i >= cards.length;
          return (
          <li
            key={`${card.watchHref ?? "no-href"}-${i}`}
            className="w-[min(320px,80vw)] shrink-0 snap-start sm:w-85 md:w-95"
            aria-hidden={isClone ? true : undefined}
          >
            <BannerCard
              {...card}
              imagePriority={!isClone && i < imagePriorityCount}
              imageContain={card.imageContain}
            />
          </li>
          );
        })}
      </ul>
    </div>
  );
}
