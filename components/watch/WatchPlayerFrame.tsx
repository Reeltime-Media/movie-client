"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type WatchPlayerFrameProps = {
  children: ReactNode;
  /** Series desktop theater — fill the side pane instead of locking 16:9. */
  theater?: boolean;
};

/**
 * Sizes a 16:9 player so it always fits the visible phone screen.
 *
 * Critical: we set maxWidth + aspect-ratio (NOT a fixed height). If the parent
 * is narrower than the computed width, maxWidth clamps and aspect-ratio keeps
 * height in sync — a fixed height was the bug that pillarboxed video after
 * rotating landscape → portrait.
 */
export function WatchPlayerFrame({ children, theater = false }: WatchPlayerFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  /** Max width that still fits in the visible viewport as 16:9. null = fill parent. */
  const [maxW, setMaxW] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const desktopTheater =
        theater && window.matchMedia("(min-width: 1024px)").matches;
      if (desktopTheater) {
        setMaxW(null);
        return;
      }

      const parent = el.parentElement;
      if (!parent) return;

      const availW = parent.clientWidth;
      if (availW <= 0) return;

      const vv = window.visualViewport;
      const viewBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
      // Prefer parent top — stable even while our own height is changing.
      const top = parent.getBoundingClientRect().top;
      const availH = Math.max(140, viewBottom - top - 8);

      // Largest 16:9 width that fits in availW x availH.
      const byWidth = availW;
      const byHeight = availH * (16 / 9);
      const next = Math.floor(Math.min(byWidth, byHeight));

      setMaxW((prev) => (prev === next ? prev : next));
    };

    measure();

    const parent = el.parentElement;
    const ro = new ResizeObserver(measure);
    if (parent) ro.observe(parent);

    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, [theater]);

  const desktopFill = theater && maxW === null;

  const style: CSSProperties = desktopFill
    ? {
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#000",
      }
    : {
        position: "relative",
        width: "100%",
        maxWidth: maxW ?? "100%",
        aspectRatio: "16 / 9",
        height: "auto",
        marginInline: "auto",
        overflow: "hidden",
        background: "#000",
      };

  return (
    <div
      ref={ref}
      className={
        theater
          ? "watch-player-frame watch-player-frame--theater"
          : "watch-player-frame"
      }
      style={style}
      data-watch-frame={maxW != null ? `v2-maxw-${maxW}` : "v2-fill"}
    >
      {children}
    </div>
  );
}
