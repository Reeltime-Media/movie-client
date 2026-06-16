"use client";

import { useCallback, useEffect, useRef } from "react";

const SCROLL_DURATION = 2000;  // ms scrolling
const PAUSE_DURATION  = 500;   // ms paused

export function useAutoScroll(
  speed = 0.6,
  resumeDelay = 2000,
  direction: "left" | "right" = "left",
) {
  const ref        = useRef<HTMLDivElement>(null);
  const rafRef     = useRef<number>(0);
  // User interaction pause
  const userPausedRef   = useRef(false);
  const timerRef        = useRef<ReturnType<typeof setTimeout>>();
  // Rhythm cycle
  const phaseRef        = useRef<"scrolling" | "paused">("scrolling");
  const phaseStartRef   = useRef<number>(performance.now());

  const userPause = useCallback(() => {
    userPausedRef.current = true;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      userPausedRef.current = false;
      // Reset rhythm so it starts a fresh scroll phase after user lets go
      phaseRef.current = "scrolling";
      phaseStartRef.current = performance.now();
    }, resumeDelay);
  }, [resumeDelay]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const el = ref.current;
    if (!el) return;

    const half = () => el.scrollWidth / 2;

    if (direction === "right") el.scrollLeft = half();

    const tick = (now: number) => {
      if (!userPausedRef.current) {
        const elapsed = now - phaseStartRef.current;

        if (phaseRef.current === "scrolling") {
          // Scroll this frame
          if (direction === "left") {
            el.scrollLeft += speed;
            if (el.scrollLeft >= half()) el.scrollLeft = 0;
          } else {
            el.scrollLeft -= speed;
            if (el.scrollLeft <= 0) el.scrollLeft = half();
          }
          // Switch to pause phase after SCROLL_DURATION
          if (elapsed >= SCROLL_DURATION) {
            phaseRef.current = "paused";
            phaseStartRef.current = now;
          }
        } else {
          // Paused phase — do nothing, just wait
          if (elapsed >= PAUSE_DURATION) {
            phaseRef.current = "scrolling";
            phaseStartRef.current = now;
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    el.addEventListener("mousedown",  userPause, { passive: true });
    el.addEventListener("touchstart", userPause, { passive: true });
    el.addEventListener("wheel",      userPause, { passive: true });
    el.addEventListener("mouseleave", () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        userPausedRef.current = false;
        phaseRef.current = "scrolling";
        phaseStartRef.current = performance.now();
      }, resumeDelay);
    }, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
      el.removeEventListener("mousedown",  userPause);
      el.removeEventListener("touchstart", userPause);
      el.removeEventListener("wheel",      userPause);
    };
  }, [speed, direction, resumeDelay, userPause]);

  return ref;
}
