import { ChevronRight } from "lucide-react";
import Link from "next/link";

const seeAllClassName =
  "group inline-flex items-center gap-1 text-[12px] font-medium text-text-muted transition-colors hover:text-text";

export function SectionHeader({
  title,
  showSeeAll = false,
  seeAllHref,
  seeAllLabel = "See all",
}: {
  title: string;
  showSeeAll?: boolean;
  /** When set with showSeeAll, navigates to this route instead of a placeholder hash. */
  seeAllHref?: string;
  /** Override for i18n (default English). */
  seeAllLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[17px] font-bold tracking-[-0.01em] text-text">
        {title}
      </h2>

      {showSeeAll ? (
        seeAllHref ? (
          <Link href={seeAllHref} className={seeAllClassName}>
            <span>{seeAllLabel}</span>
            <ChevronRight
              size={14}
              className="transition-transform group-hover:translate-x-[2px]"
            />
          </Link>
        ) : (
          <a href="#" className={seeAllClassName}>
            <span>{seeAllLabel}</span>
            <ChevronRight
              size={14}
              className="transition-transform group-hover:translate-x-[2px]"
            />
          </a>
        )
      ) : null}
    </div>
  );
}

