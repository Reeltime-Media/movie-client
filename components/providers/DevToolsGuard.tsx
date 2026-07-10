"use client";

import { useEffect } from "react";

/**
 * Best-effort deterrent only — DevTools access is controlled by the browser,
 * not the page, so this cannot actually block a determined user (they can
 * still open DevTools via the browser menu). It just removes the obvious
 * shortcuts (right-click, F12, Ctrl/Cmd+Shift+I/J/C, Ctrl/Cmd+U).
 */
export function DevToolsGuard() {
  useEffect(() => {
    const blockContextMenu = (e: MouseEvent) => e.preventDefault();

    const blockKeys = (e: KeyboardEvent) => {
      if (!e.key) return;
      const key = e.key.toLowerCase();
      const modifier = e.ctrlKey || e.metaKey;

      if (key === "f12") {
        e.preventDefault();
        return;
      }
      if (modifier && e.shiftKey && ["i", "j", "c"].includes(key)) {
        e.preventDefault();
        return;
      }
      if (modifier && key === "u") {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  return null;
}
