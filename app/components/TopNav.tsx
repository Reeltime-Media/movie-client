"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Moon, Search, Sun } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "Series", href: "/series" },
  { label: "My library", href: "/my-library" },
] as const;

export function TopNav() {
  const pathname = usePathname();

  function applyTheme(t: "dark" | "light") {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("reeltime-theme", t);
    } catch {}
  }

  function toggleTheme() {
    const current =
      (document.documentElement.dataset.theme as "dark" | "light" | undefined) ??
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");
    applyTheme(current === "dark" ? "light" : "dark");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-elevated bg-bg/95 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-[14px]">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-[10px]">
            <div className="h-[26px] w-[26px] overflow-hidden rounded-[4px] bg-brand">
              <Image
                src="/logo_r.jpeg"
                alt="Reeltime logo"
                width={26}
                height={26}
                priority
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="text-[14px] font-extrabold tracking-[0.06em] text-text">
              REELTIME
            </div>
          </Link>

          <nav className="hidden items-center gap-[22px] md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={[
                  "text-[12px] font-medium transition-colors",
                  pathname === link.href
                    ? "text-text"
                    : "text-text-muted hover:text-text",
                ].join(" ")}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-9 w-9 place-items-center rounded-[6px] text-text-muted transition-colors hover:text-text"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <Sun size={16} className="rt-theme-sun" />
            <Moon size={16} className="rt-theme-moon" />
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-[6px] text-text-muted transition-colors hover:text-text"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-[6px] text-text-muted transition-colors hover:text-text"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>

          {pathname === "/login" ? (
            <Link
              href="/register"
              className="hidden rounded-[6px] border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover md:inline-flex"
            >
              Create account
            </Link>
          ) : pathname === "/register" ? (
            <Link
              href="/login"
              className="hidden rounded-[6px] border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover md:inline-flex"
            >
              Sign in
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-[6px] border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover md:inline-flex"
            >
              Sign in
            </Link>
          )}

          <div
            className="grid h-[26px] w-[26px] place-items-center rounded-full bg-border text-[12px] font-semibold text-text"
            aria-label="Avatar"
            title="Account"
          >
            K
          </div>
        </div>
      </div>
    </header>
  );
}

