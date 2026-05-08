"use client";

export function ThemeInit() {
  if (typeof document !== "undefined") {
    try {
      const stored = localStorage.getItem("reeltime-theme");
      if (stored === "dark" || stored === "light") {
        document.documentElement.dataset.theme = stored;
      }
    } catch {}
  }

  return null;
}

