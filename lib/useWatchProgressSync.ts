"use client";

import { useCallback, useEffect, useRef } from "react";
import { upsertWatchProgress } from "@/lib/api/watch-progress";
import { isLoggedIn } from "@/lib/api/client";

const MIN_WATCH_SECONDS = 30;
const MIN_WATCH_RATIO = 0.1;
const SAVE_INTERVAL_MS = 20_000;

export function qualifiesAsWatch(positionSeconds: number, durationSeconds: number): boolean {
  if (positionSeconds >= MIN_WATCH_SECONDS) return true;
  if (durationSeconds > 0 && positionSeconds / durationSeconds >= MIN_WATCH_RATIO) {
    return true;
  }
  return false;
}

function isCompleted(positionSeconds: number, durationSeconds: number): boolean {
  if (durationSeconds <= 0) return false;
  return positionSeconds / durationSeconds >= 0.9;
}

export function useWatchProgressSync({
  contentId,
  currentTime,
  duration,
}: {
  contentId?: string;
  currentTime: number;
  duration: number;
}) {
  const lastSavedAtRef = useRef(0);
  const lastPositionRef = useRef(0);
  const hasQualifiedRef = useRef(false);
  const contentIdRef = useRef(contentId);
  const durationRef = useRef(duration);

  contentIdRef.current = contentId;
  durationRef.current = duration;
  lastPositionRef.current = currentTime;

  const save = useCallback((position: number, completed: boolean, keepalive = false) => {
    const id = contentIdRef.current;
    const dur = durationRef.current;
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

    if (!qualifiesAsWatch(currentTime, duration)) return;

    const now = Date.now();
    if (now - lastSavedAtRef.current < SAVE_INTERVAL_MS) return;

    save(currentTime, isCompleted(currentTime, duration));
  }, [contentId, currentTime, duration, save]);

  useEffect(() => {
    if (!contentId) return;

    const flush = () => {
      const position = lastPositionRef.current;
      if (!hasQualifiedRef.current && !qualifiesAsWatch(position, duration)) return;
      save(position, isCompleted(position, duration), true);
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
  }, [contentId, duration, save]);

  const markCompleted = useCallback(() => {
    save(lastPositionRef.current, true, true);
  }, [save]);

  const flushProgress = useCallback(() => {
    const position = lastPositionRef.current;
    const dur = durationRef.current;
    save(position, isCompleted(position, dur), true);
  }, [save]);

  return { markCompleted, flushProgress };
}
