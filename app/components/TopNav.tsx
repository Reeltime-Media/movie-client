"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown, Menu, Moon, Search, Sun, X } from "lucide-react";

import { refreshUserSession } from "@/lib/api/auth";
import { clearToken, getAuthSnapshot, subscribeAuth } from "@/lib/api/client";
import {
  getServerUserSnapshot,
  getUserSnapshot,
  subscribeUser,
} from "@/lib/user-session";
import type { Locale, TranslationKey } from "@/lib/i18n";
import { useI18n } from "./LocaleProvider";
import { UserAvatar } from "./UserAvatar";

const navLinks: { labelKey: TranslationKey; href: string; requiresAuth?: boolean }[] = [
  { labelKey: "navHome", href: "/" },
  { labelKey: "navMovies", href: "/movies" },
  { labelKey: "navSeries", href: "/series" },
  { labelKey: "navPricing", href: "/pricing" },
  { labelKey: "navMyLibrary", href: "/my-library", requiresAuth: true },
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

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function iconButtonClassName(extra = "") {
  return [
    "inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent text-text-muted transition-colors",
    "hover:bg-surface hover:text-text",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

function navLinkClassName(active: boolean) {
  return [
    "relative rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
    active
      ? "bg-brand text-white"
      : "text-text-muted hover:bg-surface hover:text-text",
  ].join(" ");
}

function mobileNavLinkClassName(active: boolean) {
  return [
    "flex min-h-11 items-center rounded-lg px-3 text-[15px] font-semibold transition-colors",
    active ? "bg-brand text-white" : "text-text-muted hover:bg-surface hover:text-text",
  ].join(" ");
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useSyncExternalStore(subscribeTheme, resolveTheme, () => "dark");
  const loggedIn = useSyncExternalStore(subscribeAuth, getAuthSnapshot, () => false);
  const user = useSyncExternalStore(
    subscribeUser,
    getUserSnapshot,
    getServerUserSnapshot,
  );
  const { locale, setLocale, t } = useI18n();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const visibleLinks = navLinks.filter((link) => !link.requiresAuth || loggedIn);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (loggedIn && !user) {
      void refreshUserSession().catch(() => clearToken());
    }
  }, [loggedIn, user]);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen]);

  function toggleTheme() {
    applyTheme(resolveTheme() === "dark" ? "light" : "dark");
  }

  function setLang(next: Locale) {
    setLocale(next);
  }

  function handleSignOut() {
    clearToken();
    setAccountOpen(false);
    setMobileOpen(false);
    router.push("/login");
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    setMobileOpen(false);
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-bg/90 backdrop-blur-md supports-[backdrop-filter]:bg-bg/80">
      <div className="mx-auto flex h-[3.75rem] max-w-7xl items-center gap-3 px-4 sm:gap-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
        >
          <div className="h-7 w-7 overflow-hidden rounded-md bg-brand">
            <Image
              src="/logo_r.jpeg"
              alt="Reeltime logo"
              width={28}
              height={28}
              priority
              className="h-full w-full object-cover object-top"
            />
          </div>
          <span className="hidden text-[14px] font-extrabold tracking-[0.06em] text-text sm:inline">
            REELTIME
          </span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {visibleLinks.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={navLinkClassName(active)}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </nav>

        <form
          className="relative mx-auto hidden min-w-0 max-w-md flex-1 md:block lg:max-w-sm xl:max-w-md"
          role="search"
          onSubmit={submitSearch}
        >
          <label htmlFor="topnav-search" className="sr-only">
            {t("navSearch")}
          </label>
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <input
            id="topnav-search"
            name="q"
            type="text"
            inputMode="search"
            enterKeyHint="search"
            placeholder={t("searchPlaceholder")}
            className="rt-search-input h-10 w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-[13px] text-text outline-none transition-colors placeholder:text-text-disabled focus:border-border-hover focus:bg-surface-elevated"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <div
            className="hidden items-center rounded-lg border border-border bg-surface p-0.5 sm:flex"
            role="group"
            aria-label={t("langSwitch")}
          >
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={locale === "en"}
              className={[
                "cursor-pointer rounded-md px-2.5 py-1.5 text-[11px] font-bold transition-colors",
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
                "cursor-pointer rounded-md px-2.5 py-1.5 text-[11px] font-bold transition-colors",
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
            className={iconButtonClassName()}
            aria-label={theme === "dark" ? t("navThemeToLight") : t("navThemeToDark")}
          >
            {theme === "dark" ? <Moon size={17} aria-hidden /> : <Sun size={17} aria-hidden />}
          </button>

          <Link
            href="/search"
            className={iconButtonClassName("md:hidden")}
            aria-label={t("navSearch")}
          >
            <Search size={17} aria-hidden />
          </Link>

          {loggedIn ? (
            <div ref={accountRef} className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                className={[
                  "inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface py-1.5 pl-1.5 pr-2.5 transition-colors",
                  "hover:border-border-hover hover:bg-surface-elevated",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
                  accountOpen ? "border-border-hover bg-surface-elevated" : "",
                ].join(" ")}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label={t("navAccountMenu")}
              >
                <UserAvatar
                  name={user?.full_name}
                  email={user?.email}
                  avatarUrl={user?.avatar_url}
                  size="sm"
                />
                <ChevronDown
                  size={14}
                  className={[
                    "text-text-muted transition-transform",
                    accountOpen ? "rotate-180" : "",
                  ].join(" ")}
                  aria-hidden
                />
              </button>

              {accountOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[11rem] overflow-hidden rounded-lg border border-border bg-surface py-1"
                >
                  <Link
                    href="/profile"
                    role="menuitem"
                    className="block px-3 py-2.5 text-[13px] font-medium text-text transition-colors hover:bg-surface-elevated"
                    onClick={() => setAccountOpen(false)}
                  >
                    {t("navProfile")}
                  </Link>
                  <Link
                    href="/my-library"
                    role="menuitem"
                    className="block px-3 py-2.5 text-[13px] font-medium text-text transition-colors hover:bg-surface-elevated"
                    onClick={() => setAccountOpen(false)}
                  >
                    {t("navMyLibrary")}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="block w-full px-3 py-2.5 text-left text-[13px] font-medium text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
                  >
                    {t("navSignOut")}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href={isAuthPage && pathname === "/login" ? "/register" : "/login"}
              className="hidden rounded-lg bg-brand px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 md:inline-flex"
            >
              {isAuthPage && pathname === "/login"
                ? t("navCreateAccount")
                : t("navSignIn")}
            </Link>
          )}

          <button
            type="button"
            className={iconButtonClassName("lg:hidden")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            aria-label={mobileOpen ? t("navCloseMenu") : t("navOpenMenu")}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <>
          <button
            type="button"
            aria-label={t("navCloseMenu")}
            className="fixed inset-0 top-[3.75rem] z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="mobile-nav-panel"
            className="relative z-50 border-t border-border bg-bg lg:hidden"
          >
            <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 md:px-6">
              <form role="search" onSubmit={submitSearch} className="relative md:hidden">
                <label htmlFor="topnav-search-mobile" className="sr-only">
                  {t("navSearch")}
                </label>
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  aria-hidden
                />
                <input
                  id="topnav-search-mobile"
                  name="q"
                  type="text"
                  inputMode="search"
                  enterKeyHint="search"
                  placeholder={t("searchPlaceholder")}
                  className="rt-search-input h-11 w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-3 text-[14px] text-text outline-none placeholder:text-text-disabled focus:border-border-hover"
                />
              </form>

              <nav className="flex flex-col gap-1" aria-label="Primary mobile">
                {visibleLinks.map((link) => {
                  const active = isNavActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={mobileNavLinkClassName(active)}
                      onClick={() => setMobileOpen(false)}
                    >
                      {t(link.labelKey)}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                <span className="text-[12px] font-semibold text-text-muted">{t("langSwitch")}</span>
                <div className="flex items-center rounded-md border border-border bg-bg p-0.5">
                  <button
                    type="button"
                    onClick={() => setLang("en")}
                    aria-pressed={locale === "en"}
                    className={[
                      "cursor-pointer rounded px-2.5 py-1 text-[11px] font-bold",
                      locale === "en" ? "bg-surface-elevated text-text" : "text-text-muted",
                    ].join(" ")}
                  >
                    {t("langEnglish")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang("km")}
                    aria-pressed={locale === "km"}
                    className={[
                      "cursor-pointer rounded px-2.5 py-1 text-[11px] font-bold",
                      locale === "km" ? "bg-surface-elevated text-text" : "text-text-muted",
                    ].join(" ")}
                  >
                    {t("langKhmer")}
                  </button>
                </div>
              </div>

              {loggedIn ? (
                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex items-center gap-3 px-1">
                    <UserAvatar
                      name={user?.full_name}
                      email={user?.email}
                      avatarUrl={user?.avatar_url}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-text">
                        {user?.full_name || user?.email || t("navProfile")}
                      </p>
                      {user?.email ? (
                        <p className="truncate text-[12px] text-text-muted">{user.email}</p>
                      ) : null}
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="flex min-h-11 items-center rounded-lg px-3 text-[15px] font-semibold text-text hover:bg-surface"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("navProfile")}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-[15px] font-semibold text-text-muted hover:bg-surface hover:text-text"
                  >
                    {t("navSignOut")}
                  </button>
                </div>
              ) : (
                <Link
                  href={isAuthPage && pathname === "/login" ? "/register" : "/login"}
                  className="flex min-h-11 items-center justify-center rounded-lg bg-brand px-4 text-[14px] font-bold text-white hover:bg-brand-hover"
                  onClick={() => setMobileOpen(false)}
                >
                  {isAuthPage && pathname === "/login"
                    ? t("navCreateAccount")
                    : t("navSignIn")}
                </Link>
              )}
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
