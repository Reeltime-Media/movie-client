"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/hooks/auth/use-auth";
import type { TranslationKey } from "@/lib/i18n";
import { useI18n } from "@/components/providers/LocaleProvider";

const footerNav: { href: string; labelKey: TranslationKey; requiresAuth?: boolean }[] = [
  { href: "/", labelKey: "navHome" },
  { href: "/movies", labelKey: "navMovies" },
  { href: "/series", labelKey: "navSeries" },
  { href: "/pricing", labelKey: "navPricing" },
  { href: "/my-library", labelKey: "navMyLibrary", requiresAuth: true },
  { href: "/profile", labelKey: "navProfile" },
];

export function SiteFooter() {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface/40">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="flex cursor-pointer items-center gap-2.5">
              <div className="h-7 w-7 overflow-hidden rounded-md bg-brand shadow-[0_4px_12px_-4px_rgba(229,9,20,0.6)]">
                <Image
                  src="/logo_r.jpeg"
                  alt="Reeltime logo"
                  width={28}
                  height={28}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <span className="text-[14px] font-extrabold tracking-[0.06em] text-text">
                REELTIME
              </span>
            </Link>
            <p className="mt-3 text-[12px] leading-relaxed text-text-muted">
              {t("footerTagline")}
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-2.5 sm:grid-cols-1">
            {footerNav
              .filter((l) => !l.requiresAuth || loggedIn)
              .map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="cursor-pointer text-[13px] font-medium text-text-muted transition-colors duration-200 hover:text-text"
                >
                  {t(l.labelKey)}
                </Link>
              ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-[11px] text-text-disabled">
          <span>{t("footerCopyright").replace("{year}", String(year))}</span>
          <div className="flex items-center gap-5">
            <Link href="#" className="cursor-pointer transition-colors hover:text-text-muted">
              {t("footerPrivacy")}
            </Link>
            <Link href="#" className="cursor-pointer transition-colors hover:text-text-muted">
              {t("footerTerms")}
            </Link>
            <Link href="#" className="cursor-pointer transition-colors hover:text-text-muted">
              {t("footerHelp")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
