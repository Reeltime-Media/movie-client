import Link from "next/link";
import { Lock, PlayCircle } from "lucide-react";
import type { SeasonRead } from "@/lib/api/types";
import { seriesPricingHref } from "@/lib/series-pricing";

export function WatchSeriesEpisodeSidebar({
  seriesSlug,
  seriesTitle,
  seasons,
  activeSeason,
  activeEpisode,
  hasSubscription = false,
  isAdmin = false,
  onEpisodeHover,
}: {
  seriesSlug: string;
  seriesTitle: string;
  seasons: SeasonRead[];
  activeSeason: number;
  activeEpisode: number;
  hasSubscription?: boolean;
  isAdmin?: boolean;
  /** Warm the stream URL when a playable episode is hovered/focused. */
  onEpisodeHover?: (episodeId: string) => void;
}) {
  const seasonData = seasons.find((s) => s.season_number === activeSeason);
  const episodes = seasonData?.episodes ?? [];
  const showSeasonTabs = seasons.length > 1;

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      {showSeasonTabs ? (
        <div className="shrink-0 border-b border-border px-3 py-2">
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Seasons">
            {seasons.map((s) => {
              const isSeasonActive = s.season_number === activeSeason;
              return (
                <Link
                  key={s.season_number}
                  role="tab"
                  aria-selected={isSeasonActive}
                  href={`/watch/series/${seriesSlug}/${s.season_number}/1`}
                  className={[
                    "rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                    isSeasonActive
                      ? "bg-surface-elevated text-text"
                      : "text-text-muted hover:bg-surface-elevated/70 hover:text-text",
                  ].join(" ")}
                >
                  Season {s.season_number}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="shrink-0 border-b border-border px-4 py-3">
        <h2 className="text-[13px] font-bold tracking-[-0.01em] text-text">
          Episodes
          {showSeasonTabs ? (
            <span className="ml-1.5 font-medium text-text-muted">· S{activeSeason}</span>
          ) : null}
        </h2>
        <p className="mt-0.5 text-[11px] text-text-muted">
          {episodes.length} episode{episodes.length === 1 ? "" : "s"}
        </p>
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain lg:max-h-none"
        aria-label={`Season ${activeSeason} episodes`}
      >
        <ul className="m-0 list-none divide-y divide-border p-0">
          {episodes.map((ep) => {
            const epNum = ep.episode_number ?? 0;
            const isActive = epNum === activeEpisode;
            const isFree = ep.is_free === true;
            const canPrefetch = isAdmin || isFree || hasSubscription;
            const href = isFree || hasSubscription || isAdmin
              ? `/watch/series/${seriesSlug}/${activeSeason}/${epNum}`
              : seriesPricingHref({
                  slug: seriesSlug,
                  title: seriesTitle,
                  season: activeSeason,
                  episode: epNum,
                });
            return (
              <li key={epNum}>
                <Link
                  href={href}
                  aria-current={isActive ? "true" : undefined}
                  onMouseEnter={
                    canPrefetch && onEpisodeHover
                      ? () => onEpisodeHover(ep.id)
                      : undefined
                  }
                  onFocus={
                    canPrefetch && onEpisodeHover
                      ? () => onEpisodeHover(ep.id)
                      : undefined
                  }
                  className={[
                    "flex min-h-[56px] items-stretch outline-none transition-colors",
                    isActive ? "bg-surface-elevated" : "hover:bg-surface-elevated/70",
                    "focus-visible:bg-surface-elevated/80",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "w-1 shrink-0 self-stretch",
                      isActive ? "bg-brand" : "bg-transparent",
                    ].join(" ")}
                    aria-hidden
                  />
                  <span className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">
                    <span
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-bold",
                        isActive
                          ? "bg-brand text-white"
                          : "bg-surface-elevated text-text-muted",
                      ].join(" ")}
                    >
                      {epNum}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={[
                          "block truncate text-[12px] font-semibold",
                          isActive ? "text-text" : "text-text-muted",
                        ].join(" ")}
                      >
                        {ep.title}
                      </span>
                      {ep.runtime ? (
                        <span className="mt-0.5 block text-[10px] text-text-disabled">
                          {ep.runtime}
                        </span>
                      ) : null}
                    </span>
                    {!isFree && !hasSubscription && !isAdmin ? (
                      <Lock size={14} className="shrink-0 text-text-disabled" aria-hidden />
                    ) : (
                      <PlayCircle
                        size={14}
                        className={[
                          "shrink-0",
                          isActive ? "text-brand" : "text-text-disabled",
                        ].join(" ")}
                        aria-hidden
                      />
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
