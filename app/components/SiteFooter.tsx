"use client";

import Link from "next/link";

import type { TranslationKey } from "@/lib/i18n";
import { useI18n } from "./LocaleProvider";

const footerNav: { href: string; labelKey: TranslationKey }[] = [
  { href: "/", labelKey: "navHome" },
  { href: "/movies", labelKey: "navMovies" },
  { href: "/series", labelKey: "navSeries" },
  { href: "/my-library", labelKey: "navMyLibrary" },
  { href: "/profile", labelKey: "navProfile" },
];

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-bg">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 md:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-6.5 w-6.5 items-center justify-center rounded-sm bg-brand text-[13px] font-black text-white">
                R
              </div>
              <span className="text-[13px] font-black tracking-[0.06em] text-text">
                REELTIME
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-text-disabled">
              {t("footerTagline")}
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footerNav.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[12px] font-medium text-text-muted transition-colors hover:text-text"
              >
                {t(l.labelKey)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-[11px] text-text-disabled">
          <span>{t("footerCopyright").replace("{year}", String(year))}</span>
          <div className="flex items-center gap-4">
            <Link href="#" className="transition-colors hover:text-text-muted">
              {t("footerPrivacy")}
            </Link>
            <Link href="#" className="transition-colors hover:text-text-muted">
              {t("footerTerms")}
            </Link>
            <Link href="#" className="transition-colors hover:text-text-muted">
              {t("footerHelp")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
