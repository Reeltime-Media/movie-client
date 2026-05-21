import Link from "next/link";
import { Lock, PlayCircle } from "lucide-react";
import type { SeasonRead } from "@/lib/api/types";

export function WatchSeriesEpisodeSidebar({
  seriesSlug,
  seriesTitle,
  seasons,
  activeSeason,
  activeEpisode,
  freeEpisodeCount,
}: {
  seriesSlug: string;
  seriesTitle: string;
  seasons: SeasonRead[];
  activeSeason: number;
  activeEpisode: number;
  freeEpisodeCount: number;
}) {
  const seasonData = seasons.find((s) => s.season_number === activeSeason);
  const episodes = seasonData?.episodes ?? [];
  const showSeasonTabs = seasons.length > 1;

  return (
    <aside className="flex min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-[6px] border border-border bg-surface lg:h-full lg:max-w-[300px] lg:shrink-0">
      {showSeasonTabs ? (
        <div className="shrink-0 border-b border-border px-2 py-2">
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
                    "rounded-[6px] px-3 py-1.5 text-[12px] font-semibold transition-colors",
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
            <span className="ml-1.5 font-medium text-text-muted">
              · S{activeSeason}
            </span>
          ) : null}
        </h2>
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        aria-label={`Season ${activeSeason} episodes`}
      >
        <ul className="m-0 list-none divide-y divide-border p-0">
          {episodes.map((ep) => {
            const epNum = ep.episode_number ?? 0;
            const isActive = epNum === activeEpisode;
            const isFree = epNum <= freeEpisodeCount;
            const href = isFree
              ? `/watch/series/${seriesSlug}/${activeSeason}/${epNum}`
              : `/pay/subscription?title=${encodeURIComponent(seriesTitle)}&season=${activeSeason}&episode=${epNum}`;
            return (
              <li key={epNum}>
                <Link
                  href={href}
                  className={[
                    "flex min-h-[52px] items-stretch outline-none transition-colors",
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
                  <span className="flex min-w-0 flex-1 items-baseline gap-3 px-3 py-3 pr-4">
                    <span className="shrink-0 text-[14px] font-bold tabular-nums text-brand">
                      {epNum}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span
                        className={[
                          "min-w-0 text-[13px] font-medium leading-snug text-text",
                          isActive ? "font-semibold" : "",
                        ].join(" ")}
                      >
                        {ep.title}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                        {isFree ? (
                          <>
                            <PlayCircle size={11} className="text-success" aria-hidden />
                            <span className="text-success">Free</span>
                          </>
                        ) : (
                          <>
                            <Lock size={11} className="text-brand" aria-hidden />
                            <span className="text-text-muted">Subscribe</span>
                          </>
                        )}
                      </span>
                    </span>
                    {ep.runtime && (
                      <span className="shrink-0 text-[11px] text-text-disabled">{ep.runtime}</span>
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
