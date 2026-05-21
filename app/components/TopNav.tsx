"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Bell, Moon, Search, Sun } from "lucide-react";

import { clearToken, getAuthSnapshot, subscribeAuth } from "@/lib/api/client";
import type { Locale, TranslationKey } from "@/lib/i18n";
import { useI18n } from "./LocaleProvider";

const navLinks: { labelKey: TranslationKey; href: string }[] = [
  { labelKey: "navHome", href: "/" },
  { labelKey: "navMovies", href: "/movies" },
  { labelKey: "navSeries", href: "/series" },
  { labelKey: "navMyLibrary", href: "/my-library" },
];

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
  try {
    localStorage.setItem("reeltime-theme", t);
  } catch {
    /* ignore */
  }
  notifyThemeSubscribers();
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useSyncExternalStore(subscribeTheme, resolveTheme, () => "dark");
  const loggedIn = useSyncExternalStore(subscribeAuth, getAuthSnapshot, () => false);
  const { locale, setLocale, t } = useI18n();

  function toggleTheme() {
    applyTheme(resolveTheme() === "dark" ? "light" : "dark");
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";

  function setLang(next: Locale) {
    setLocale(next);
  }

  function handleSignOut() {
    clearToken();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-elevated bg-bg/95 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-3.5">
        <div className="flex min-w-0 items-center gap-4 md:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
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

          <nav className="hidden min-w-0 items-center gap-5.5 md:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative shrink-0 pb-0.5 text-[12px] font-medium transition-colors",
                    active ? "text-text" : "text-text-muted hover:text-text",
                  ].join(" ")}
                >
                  {t(link.labelKey)}
                  {active && (
                    <span className="absolute -bottom-0.75 left-1/2 h-0.75 w-0.75 -translate-x-1/2 rounded-full bg-brand" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            className="flex items-center rounded-md border border-border bg-surface p-0.5"
            role="group"
            aria-label={t("langSwitch")}
          >
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={locale === "en"}
              className={[
                "cursor-pointer rounded-[5px] px-2 py-1 text-[11px] font-bold transition-colors",
                locale === "en"
                  ? "bg-surface-elevated text-text"
                  : "text-text-muted hover:text-text",
              ].join(" ")}
            >
              {t("langEnglish")}
            </button>
            <button
              type="button"
              onClick={() => setLang("km")}
              aria-pressed={locale === "km"}
              className={[
                "cursor-pointer rounded-[5px] px-2 py-1 text-[11px] font-bold transition-colors",
                locale === "km"
                  ? "bg-surface-elevated text-text"
                  : "text-text-muted hover:text-text",
              ].join(" ")}
            >
              {t("langKhmer")}
            </button>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            suppressHydrationWarning
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-md text-text-muted transition-colors hover:bg-surface hover:text-text"
            aria-label={theme === "dark" ? t("navThemeToLight") : t("navThemeToDark")}
            title={theme === "dark" ? t("navThemeToLight") : t("navThemeToDark")}
          >
            {theme === "dark" ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
          </button>

          <button
            type="button"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-md text-text-muted transition-colors hover:bg-surface hover:text-text"
            aria-label={t("navSearch")}
          >
            <Search size={16} />
          </button>

          <button
            type="button"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-md text-text-muted transition-colors hover:bg-surface hover:text-text"
            aria-label={t("navNotifications")}
          >
            <Bell size={16} />
          </button>

          {loggedIn ? (
            <>
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover md:inline-flex"
              >
                {t("navSignOut")}
              </button>
              <Link
                href="/profile"
                className="grid h-6.5 w-6.5 cursor-pointer place-items-center rounded-full bg-surface-elevated text-[12px] font-bold text-text ring-1 ring-border transition-all hover:ring-2 hover:ring-brand"
                aria-label={t("navProfile")}
                title={t("navProfile")}
              >
                B
              </Link>
            </>
          ) : isAuthPage ? (
            <Link
              href={pathname === "/login" ? "/register" : "/login"}
              className="hidden rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover md:inline-flex"
            >
              {pathname === "/login" ? t("navCreateAccount") : t("navSignIn")}
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover md:inline-flex"
            >
              {t("navSignIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
