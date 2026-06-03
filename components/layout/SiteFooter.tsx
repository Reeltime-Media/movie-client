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
  { href: "/my-library", labelKey: "navMyLibrary", requiresAuth: true },
  { href: "/profile", labelKey: "navProfile" },
];

export function SiteFooter() {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-bg">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 md:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-6.5 w-6.5 overflow-hidden rounded-sm bg-brand">
                <Image
                  src="/logo_r.jpeg"
                  alt="Reeltime logo"
                  width={26}
                  height={26}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <span className="text-[13px] font-extrabold tracking-[0.06em] text-text">
                REELTIME
              </span>
            </Link>
            <p className="mt-2 text-[11px] leading-relaxed text-text-disabled">
              {t("footerTagline")}
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footerNav.filter((l) => !l.requiresAuth || loggedIn).map((l) => (
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
