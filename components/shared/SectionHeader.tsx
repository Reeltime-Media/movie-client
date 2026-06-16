import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function SectionHeader({
  title,
  showSeeAll = false,
  seeAllHref,
  seeAllLabel = "See all",
  paddingX = "px-4 md:px-8",
}: {
  title: string;
  showSeeAll?: boolean;
  seeAllHref?: string;
  seeAllLabel?: string;
  paddingX?: string;
}) {
  const seeAllNode = showSeeAll ? (
    seeAllHref ? (
      <Link
        href={seeAllHref}
        className="group shrink-0 inline-flex items-center gap-0.5 text-[11px] font-semibold text-white/70 transition-colors duration-150 hover:text-white"
      >
        {seeAllLabel}
        <ChevronRight size={12} className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
      </Link>
    ) : (
      <a
        href="#"
        className="group shrink-0 inline-flex items-center gap-0.5 text-[11px] font-semibold text-white/70 transition-colors duration-150 hover:text-white"
      >
        {seeAllLabel}
        <ChevronRight size={12} className="transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
      </a>
    )
  ) : null;

  return (
    <div className={`${paddingX} mb-4`}>
      <div className="rt-section-header flex items-center justify-between gap-4 border border-brand/30 bg-brand px-4 py-3 shadow-[0_4px_24px_-6px_rgba(229,9,20,0.55)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="h-4 w-0.75 shrink-0 rounded-full bg-white/60" aria-hidden />
          <h2 className="text-[15px] font-bold tracking-tight text-white">{title}</h2>
        </div>
        {seeAllNode}
      </div>
    </div>
  );
}
