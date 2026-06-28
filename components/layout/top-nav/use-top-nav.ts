"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import type { Locale } from "@/lib/i18n";
import { clearToken } from "@/lib/auth/token";
import { useI18n } from "@/components/providers/LocaleProvider";
import { navLinks } from "./constants";
import { resolveTheme, subscribeTheme } from "./theme";

export function useTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useSyncExternalStore(subscribeTheme, resolveTheme, () => "dark" as const);
  const { loggedIn } = useAuth();
  const { user } = useUser();
  const { locale, setLocale, t } = useI18n();

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const visibleLinks = navLinks.filter((link) => !link.requiresAuth || loggedIn);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

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

  function setLang(next: Locale) {
    setLocale(next);
  }

  function closeMenus() {
    setAccountOpen(false);
  }

  function handleSignOut() {
    clearToken();
    closeMenus();
    router.push("/login");
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return {
    pathname,
    theme,
    loggedIn,
    user,
    locale,
    t,
    accountOpen,
    setAccountOpen,
    accountRef,
    visibleLinks,
    isAuthPage,
    setLang,
    handleSignOut,
    submitSearch,
    closeMenus,
  };
}

export type TopNavState = ReturnType<typeof useTopNav>;
