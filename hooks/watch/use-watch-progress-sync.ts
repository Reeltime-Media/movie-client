"use client";

import { useCallback, useEffect, useRef } from "react";

import { upsertWatchProgress } from "@/lib/api/playback";
import { isLoggedIn } from "@/lib/api/core";
import {
  isWatchCompleted,
  qualifiesAsWatch,
  WATCH_PROGRESS_SAVE_INTERVAL_MS,
} from "@/lib/watch/progress";

export function useWatchProgressSync({
  contentId,
  getPosition,
  getDuration,
}: {
  contentId?: string;
  getPosition: () => number;
  getDuration: () => number;
}) {
  const lastSavedAtRef = useRef(0);
  const hasQualifiedRef = useRef(false);
  const contentIdRef = useRef(contentId);
  const getPositionRef = useRef(getPosition);
  const getDurationRef = useRef(getDuration);

  useEffect(() => {
    contentIdRef.current = contentId;
    getPositionRef.current = getPosition;
    getDurationRef.current = getDuration;
  });

  const save = useCallback((position: number, completed: boolean, keepalive = false) => {
    const id = contentIdRef.current;
    const dur = getDurationRef.current();
    if (!id || !isLoggedIn()) return;
    if (!qualifiesAsWatch(position, dur) && !completed) return;

    hasQualifiedRef.current = true;
    lastSavedAtRef.current = Date.now();

    void upsertWatchProgress(
      id,
      {
        position_seconds: Math.floor(position),
        completed,
      },
      { keepalive },
    ).catch(() => {
      /* ignore — resume tracking is best-effort */
    });
  }, []);

  useEffect(() => {
    if (!contentId || !isLoggedIn()) return;

    const tick = () => {
      const position = getPositionRef.current();
      const duration = getDurationRef.current();
      if (!qualifiesAsWatch(position, duration)) return;

      const now = Date.now();
      if (now - lastSavedAtRef.current < WATCH_PROGRESS_SAVE_INTERVAL_MS) return;

      save(position, isWatchCompleted(position, duration));
    };

    const interval = window.setInterval(tick, WATCH_PROGRESS_SAVE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [contentId, save]);

  useEffect(() => {
    if (!contentId) return;

    const flush = () => {
      const position = getPositionRef.current();
      const duration = getDurationRef.current();
      if (!hasQualifiedRef.current && !qualifiesAsWatch(position, duration)) return;
      save(position, isWatchCompleted(position, duration), true);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [contentId, save]);

  const markCompleted = useCallback(() => {
    save(getPositionRef.current(), true, true);
  }, [save]);

  const flushProgress = useCallback(() => {
    const position = getPositionRef.current();
    const dur = getDurationRef.current();
    save(position, isWatchCompleted(position, dur), true);
  }, [save]);

  return { markCompleted, flushProgress };
}
