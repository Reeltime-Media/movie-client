import { ChevronRight } from "lucide-react";

export function SectionHeader({
  title,
  showSeeAll = false,
}: {
  title: string;
  showSeeAll?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[17px] font-bold tracking-[-0.01em] text-text">
        {title}
      </h2>

      {showSeeAll ? (
        <a
          href="#"
          className="group inline-flex items-center gap-1 text-[12px] font-medium text-text-muted transition-colors hover:text-text"
        >
          <span>See all</span>
          <ChevronRight
            size={14}
            className="transition-transform group-hover:translate-x-[2px]"
          />
        </a>
      ) : null}
    </div>
  );
}

