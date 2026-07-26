"use client";

import { ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import type { RefObject } from "react";

export function SectionHeader({
  title,
  showSeeAll = false,
  seeAllHref,
  seeAllLabel = "See all",
  paddingX = "px-4 sm:px-6 md:px-8",
  scrollRef,
}: {
  title: string;
  showSeeAll?: boolean;
  seeAllHref?: string;
  seeAllLabel?: string;
  paddingX?: string;
  /** When set, renders prev/next arrows that scroll this rail. */
  scrollRef?: RefObject<HTMLElement | null>;
}) {
  const scrollBy = (dir: -1 | 1) => {
    scrollRef?.current?.scrollBy({ left: dir * 480, behavior: "smooth" });
  };

  const railControls = scrollRef ? (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        className="flex items-center justify-center text-white/85 transition-colors hover:text-white"
      >
        <Play size={13} className="rotate-180 fill-current" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        className="flex items-center justify-center text-white/85 transition-colors hover:text-white"
      >
        <Play size={13} className="fill-current" aria-hidden />
      </button>
    </div>
  ) : null;
  const seeAllNode = showSeeAll ? (
    seeAllHref ? (
      <Link
        href={seeAllHref}
        className="group shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold text-white/85 transition-colors duration-150 hover:text-white"
      >
        {seeAllLabel}
      </Link>
    ) : (
      <button
        type="button"
        className="group shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold text-white/85 transition-colors duration-150 hover:text-white"
      >
        {seeAllLabel}
      </button>
    )
  ) : null;

  return (
    <div
      className={`rt-section-header flex items-center justify-between gap-4 py-3 ${paddingX}`}
      style={{
        background: "linear-gradient(90deg, var(--rt-brand) 0%, var(--rt-brand-pressed) 40%, var(--rt-bg) 95%)",
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="h-4 w-0.75 shrink-0 rounded-full bg-white/60" aria-hidden />
        <h2 className="text-[15px] font-bold tracking-tight text-white">{title}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-10">
        {seeAllNode}
        {railControls}
      </div>
    </div>
  );
}
