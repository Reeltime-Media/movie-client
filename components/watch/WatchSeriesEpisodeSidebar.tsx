import Link from "next/link";
import { Lock, PlayCircle } from "lucide-react";
import type { SeasonRead } from "@/lib/api/types";

export function WatchSeriesEpisodeSidebar({
  seriesSlug,
  seriesTitle,
  seasons,
  activeSeason,
  activeEpisode,
}: {
  seriesSlug: string;
  seriesTitle: string;
  seasons: SeasonRead[];
  activeSeason: number;
  activeEpisode: number;
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
            const href = isFree
              ? `/watch/series/${seriesSlug}/${activeSeason}/${epNum}`
              : `/pay/subscription?slug=${encodeURIComponent(seriesSlug)}&title=${encodeURIComponent(seriesTitle)}&season=${activeSeason}&episode=${epNum}`;
            return (
              <li key={epNum}>
                <Link
                  href={href}
                  aria-current={isActive ? "true" : undefined}
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
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-bg text-[13px] font-bold tabular-nums text-brand">
                      {epNum}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={[
                          "block truncate text-[13px] leading-snug text-text",
                          isActive ? "font-semibold" : "font-medium",
                        ].join(" ")}
                      >
                        {ep.title || `Episode ${epNum}`}
                      </span>
                      <span className="mt-0.5 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
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
                        {ep.runtime ? (
                          <>
                            <span className="text-text-disabled" aria-hidden>
                              ·
                            </span>
                            <span className="normal-case tracking-normal text-text-disabled">
                              {ep.runtime}
                            </span>
                          </>
                        ) : null}
                      </span>
                    </span>
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
