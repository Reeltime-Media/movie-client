"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/components/providers/LocaleProvider";
import { isNavActive } from "@/components/layout/top-nav/utils";
import { isWatchPath } from "./watch-path";
import { bottomNavTabs } from "./tabs";

/**
 * App-style floating bottom navigation for mobile / tablet.
 * Hidden on watch routes so the player can use the full short edge.
 */
export function MobileBottomNav() {
  const pathname = usePathname() || "";
  const { t } = useI18n();

  if (isWatchPath(pathname)) return null;

  return (
    <>
      {/* In-flow spacer so content clears the fixed dock (replaces body pb-24). */}
      <div className="h-24 shrink-0 xl:hidden" aria-hidden />
      <nav
        aria-label="Primary mobile"
        data-bottom-nav="1"
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] xl:hidden"
      >
        <ul className="flex items-center gap-1 rounded-full border border-border bg-surface-elevated p-1.5">
          {bottomNavTabs.map(({ href, labelKey, Icon }) => {
            const active = isNavActive(pathname, href);
            const label = t(labelKey);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  aria-label={label}
                  className={[
                    "group flex h-11 items-center justify-center rounded-full transition-all duration-200 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                    active
                      ? "gap-2 bg-brand px-4 text-white"
                      : "w-11 text-text-muted hover:text-text active:scale-95",
                  ].join(" ")}
                >
                  <Icon size={20} aria-hidden className="shrink-0" />
                  <span
                    className={[
                      "overflow-hidden whitespace-nowrap text-[13px] font-semibold transition-all duration-200 ease-out",
                      active ? "max-w-[7rem] opacity-100" : "max-w-0 opacity-0",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
