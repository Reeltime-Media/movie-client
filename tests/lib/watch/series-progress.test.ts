import { describe, expect, it } from "vitest";

import type { SeasonRead, WatchProgressRead } from "@/lib/api/types";
import {
  mergeProgressRow,
  pickLastWatchedEpisodeId,
} from "@/lib/watch/series-progress";

const seasons: SeasonRead[] = [
  {
    season_number: 1,
    episodes: [
      {
        id: "ep-1",
        type: "episode",
        slug: "s1e1",
        title: "One",
        description: null,
        genres: [],
        poster_key: null,
        banner_key: null,
        price_usd: null,
        rating: null,
        runtime: null,
        release_year: null,
        is_free: true,
        updated_at: "",
        series_id: "s1",
        season_number: 1,
        episode_number: 1,
        duration_seconds: 1000,
        trailer_url: null,
        hls_master_key: null,
        status: "ready",
        is_published: true,
        transcode_status: "done",
        created_at: "",
      },
      {
        id: "ep-2",
        type: "episode",
        slug: "s1e2",
        title: "Two",
        description: null,
        genres: [],
        poster_key: null,
        banner_key: null,
        price_usd: null,
        rating: null,
        runtime: null,
        release_year: null,
        is_free: false,
        updated_at: "",
        series_id: "s1",
        season_number: 1,
        episode_number: 2,
        duration_seconds: 1000,
        trailer_url: null,
        hls_master_key: null,
        status: "ready",
        is_published: true,
        transcode_status: "done",
        created_at: "",
      },
    ],
  },
];

function row(
  contentId: string,
  overrides: Partial<WatchProgressRead> = {},
): WatchProgressRead {
  return {
    user_id: "u1",
    content_id: contentId,
    position_seconds: 60,
    completed: false,
    last_watched_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("pickLastWatchedEpisodeId", () => {
  it("returns catalog episode id for completed progress", () => {
    const progress = [
      row("ep-1", {
        completed: true,
        position_seconds: 900,
        last_watched_at: "2026-02-01T00:00:00Z",
      }),
    ];
    expect(pickLastWatchedEpisodeId(progress, seasons)).toBe("ep-1");
  });

  it("boosts current episode when list is empty but resume exists", () => {
    expect(
      pickLastWatchedEpisodeId([], seasons, {
        boostEpisodeId: "ep-1",
        boostPositionSeconds: 45,
      }),
    ).toBe("ep-1");
  });

  it("mergeProgressRow keeps newer rows by content id", () => {
    const merged = mergeProgressRow(
      [row("ep-1", { position_seconds: 10 })],
      row("ep-1", { position_seconds: 99, last_watched_at: "2026-03-01T00:00:00Z" }),
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]?.position_seconds).toBe(99);
  });
});
