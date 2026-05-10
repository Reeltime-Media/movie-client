"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Bell, Moon, Search, Sun } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "Series", href: "/series" },
  { label: "My library", href: "/my-library" },
] as const;

const themeSubscribers = new Set<() => void>();

function resolveTheme(): "dark" | "light" {
  const explicit = document.documentElement.dataset.theme as "dark" | "light" | undefined;
  if (explicit === "dark" || explicit === "light") return explicit;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function subscribeTheme(onStoreChange: () => void) {
  themeSubscribers.add(onStoreChange);
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  mq.addEventListener("change", onStoreChange);
  function onStorage(e: StorageEvent) {
    if (e.key === "reeltime-theme") onStoreChange();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    themeSubscribers.delete(onStoreChange);
    mq.removeEventListener("change", onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function notifyThemeSubscribers() {
  themeSubscribers.forEach((fn) => fn());
}

function applyTheme(t: "dark" | "light") {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("reeltime-theme", t); } catch {}
  notifyThemeSubscribers();
}

export function TopNav() {
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribeTheme, resolveTheme, () => "dark");

  function toggleTheme() {
    applyTheme(resolveTheme() === "dark" ? "light" : "dark");
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-elevated bg-bg/95 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-3.5">
        {/* Left — logo + nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-6.5 w-6.5 overflow-hidden rounded-sm bg-brand">
              <Image
                src="/logo_r.jpeg"
                alt="Reeltime logo"
                width={26}
                height={26}
                priority
                className="h-full w-full object-cover object-top"
              />
            </div>
            <span className="text-[14px] font-extrabold tracking-[0.06em] text-text">
              REELTIME
            </span>
          </Link>

          <nav className="hidden items-center gap-5.5 md:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative pb-0.5 text-[12px] font-medium transition-colors",
                    active ? "text-text" : "text-text-muted hover:text-text",
                  ].join(" ")}
                >
                  {link.label}
                  {/* Active dot indicator */}
                  {active && (
                    <span className="absolute -bottom-0.75 left-1/2 h-0.75 w-0.75 -translate-x-1/2 rounded-full bg-brand" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            suppressHydrationWarning
            className="grid h-9 w-9 place-items-center rounded-md text-text-muted transition-colors hover:bg-surface hover:text-text"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
          </button>

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-text-muted transition-colors hover:bg-surface hover:text-text"
            aria-label="Search"
          >
            <Search size={16} />
          </button>

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-text-muted transition-colors hover:bg-surface hover:text-text"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>

          {isAuthPage ? (
            <Link
              href={pathname === "/login" ? "/register" : "/login"}
              className="hidden rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover md:inline-flex"
            >
              {pathname === "/login" ? "Create account" : "Sign in"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover md:inline-flex"
            >
              Sign in
            </Link>
          )}

          {/* Avatar — links to profile */}
          <Link
            href="/profile"
            className="grid h-6.5 w-6.5 place-items-center rounded-full bg-surface-elevated text-[12px] font-bold text-text ring-1 ring-border transition-all hover:ring-2 hover:ring-brand"
            aria-label="Your profile"
            title="Your profile"
          >
            B
          </Link>
        </div>
      </div>
    </header>
  );
}
