import { PosterCard } from "@/components/catalog/PosterCard";
import type { PosterCardProps } from "@/types/poster-card";

export function PosterGrid({
  posters,
  imagePriorityCount = 0,
  className,
}: {
  posters: readonly PosterCardProps[];
  imagePriorityCount?: number;
  className?: string;
}) {
  if (!posters.length) return null;

  return (
    <ul
      className={[
        "m-0 grid list-none gap-3 p-0",
        "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
        className ?? "",
      ].join(" ")}
    >
      {posters.map((poster, i) => (
        <li key={`${poster.watchHref ?? "no-href"}-${i}`}>
          <PosterCard {...poster} imagePriority={i < imagePriorityCount} />
        </li>
      ))}
    </ul>
  );
}
