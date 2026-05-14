"use client";

import { LOCALE_STORAGE_KEY } from "@/lib/i18n";

export function ThemeInit() {
  if (typeof document !== "undefined") {
    try {
      const stored = localStorage.getItem("reeltime-theme");
      if (stored === "dark" || stored === "light") {
        document.documentElement.dataset.theme = stored;
      }
    } catch {}

    try {
      const loc = localStorage.getItem(LOCALE_STORAGE_KEY);
      document.documentElement.lang = loc === "km" ? "km" : "en";
    } catch {}
  }

  return null;
}

