"use client";

import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { useI18n } from "@/components/providers/LocaleProvider";
import { isNavActive } from "@/components/layout/top-nav/utils";
import { isWatchPath } from "./watch-path";
import { moreBottomNavTabs, primaryBottomNavTabs } from "./tabs";

/**
 * App-style floating bottom navigation for mobile / tablet.
 * Four primary destinations + More keeps the dock under phone widths.
 * Hidden on watch routes so the player can use the full short edge.
 */
export function MobileBottomNav() {
  const pathname = usePathname() || "";
  const { t } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);
  const morePanelId = useId();
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const morePanelRef = useRef<HTMLDivElement>(null);

  const moreActive = moreBottomNavTabs.some(({ href }) => isNavActive(pathname, href));

  // Close the More sheet when the route changes (adjust-state-during-render).
  const [morePathname, setMorePathname] = useState(pathname);
  if (morePathname !== pathname) {
    setMorePathname(pathname);
    if (moreOpen) setMoreOpen(false);
  }

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const firstLink = morePanelRef.current?.querySelector<HTMLElement>("a");
    firstLink?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  if (isWatchPath(pathname)) return null;

  return (
    <>
      <div className="h-24 shrink-0 xl:hidden" aria-hidden />
      <nav
        aria-label="Primary mobile"
        data-bottom-nav="1"
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] xl:hidden"
      >
        <div className="relative w-full max-w-md">
          {moreOpen ? (
            <>
              <button
                type="button"
                aria-label={t("navCloseMenu")}
                className="fixed inset-0 z-40 cursor-pointer bg-black/40"
                onClick={() => {
                  setMoreOpen(false);
                  moreButtonRef.current?.focus();
                }}
              />
              <div
                ref={morePanelRef}
                id={morePanelId}
                role="menu"
                aria-label={t("navMore")}
                className="absolute bottom-[calc(100%+0.5rem)] left-0 right-0 z-50 overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-lg"
              >
                <ul className="divide-y divide-border">
                  {moreBottomNavTabs.map(({ href, labelKey, Icon }) => {
                    const active = isNavActive(pathname, href);
                    const label = t(labelKey);
                    return (
                      <li key={href} role="none">
                        <Link
                          role="menuitem"
                          href={href}
                          aria-current={active ? "page" : undefined}
                          className={[
                            "flex items-center gap-3 px-4 py-3.5 text-[14px] font-semibold transition-colors",
                            "focus-visible:outline-none focus-visible:bg-surface",
                            active ? "bg-brand/10 text-brand" : "text-text hover:bg-surface",
                          ].join(" ")}
                          onClick={() => setMoreOpen(false)}
                        >
                          <Icon size={20} aria-hidden className="shrink-0" />
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          ) : null}

          <ul className="relative z-50 flex w-full items-center justify-between gap-0.5 rounded-full border border-border bg-surface-elevated p-1.5">
            {primaryBottomNavTabs.map(({ href, labelKey, Icon }) => {
              const active = isNavActive(pathname, href);
              const label = t(labelKey);
              return (
                <li key={href} className="min-w-0 flex-1">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    aria-label={label}
                    className={[
                      "group flex h-11 w-full items-center justify-center rounded-full transition-all duration-200 ease-out",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                      active
                        ? "gap-1.5 bg-brand px-2 text-white sm:gap-2 sm:px-3"
                        : "text-text-muted hover:text-text active:scale-95",
                    ].join(" ")}
                  >
                    <Icon size={20} aria-hidden className="shrink-0" />
                    <span
                      className={[
                        "overflow-hidden whitespace-nowrap text-[12px] font-semibold transition-all duration-200 ease-out sm:text-[13px]",
                        active ? "max-w-[5.5rem] opacity-100" : "max-w-0 opacity-0",
                      ].join(" ")}
                    >
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
            <li className="min-w-0 flex-1">
              <button
                ref={moreButtonRef}
                type="button"
                aria-label={t("navMore")}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                aria-controls={morePanelId}
                onClick={() => setMoreOpen((open) => !open)}
                className={[
                  "group flex h-11 w-full cursor-pointer items-center justify-center rounded-full transition-all duration-200 ease-out",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                  moreOpen || moreActive
                    ? "gap-1.5 bg-brand px-2 text-white sm:gap-2 sm:px-3"
                    : "text-text-muted hover:text-text active:scale-95",
                ].join(" ")}
              >
                <Ellipsis size={20} aria-hidden className="shrink-0" />
                <span
                  className={[
                    "overflow-hidden whitespace-nowrap text-[12px] font-semibold transition-all duration-200 ease-out sm:text-[13px]",
                    moreOpen || moreActive ? "max-w-[5.5rem] opacity-100" : "max-w-0 opacity-0",
                  ].join(" ")}
                >
                  {t("navMore")}
                </span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
