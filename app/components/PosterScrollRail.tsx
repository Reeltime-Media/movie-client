import type { PosterCardProps } from "./PosterCard";
import { PosterCard } from "./PosterCard";

export function PosterScrollRail({
  posters,
  imagePriorityCount = 0,
  className,
}: {
  posters: readonly PosterCardProps[];
  imagePriorityCount?: number;
  className?: string;
}) {
  return (
    <div
      className={[
        "mt-4 -mx-6 overflow-x-auto overflow-y-visible px-6 pb-2 pt-0.5 md:-mx-8 md:px-8",
        className ?? "",
      ].join(" ")}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <ul className="m-0 mx-auto flex w-max list-none flex-row gap-3 p-0 snap-x snap-mandatory">
        {posters.map((poster, i) => (
          <li
            key={`${poster.watchHref ?? "no-href"}-${i}`}
            className="w-[min(200px,42vw)] shrink-0 snap-start sm:w-[200px] md:w-[220px]"
          >
            <PosterCard {...poster} imagePriority={i < imagePriorityCount} />
          </li>
        ))}
      </ul>
    </div>
  );
}
