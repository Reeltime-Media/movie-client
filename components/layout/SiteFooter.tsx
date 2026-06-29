"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/hooks/auth/use-auth";
import type { TranslationKey } from "@/lib/i18n";
import { useI18n } from "@/components/providers/LocaleProvider";

type FooterLink = { href: string; labelKey: TranslationKey; requiresAuth?: boolean };

const browseLinks: FooterLink[] = [
  { href: "/", labelKey: "navHome" },
  { href: "/movies", labelKey: "navMovies" },
  { href: "/series", labelKey: "navSeries" },
  { href: "/pricing", labelKey: "navPricing" },
];

const accountLinks: FooterLink[] = [
  { href: "/my-library", labelKey: "navMyLibrary", requiresAuth: true },
  { href: "/profile", labelKey: "navProfile", requiresAuth: true },
  { href: "/login", labelKey: "navSignIn" },
];

const supportLinks: FooterLink[] = [
  { href: "#", labelKey: "footerHelp" },
  { href: "#", labelKey: "footerPrivacy" },
  { href: "#", labelKey: "footerTerms" },
  { href: "#", labelKey: "footerContact" },
];

const socialLinks = [
  {
    href: "https://facebook.com",
    label: "Facebook",
    svg: (
      <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" aria-hidden>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    href: "https://instagram.com",
    label: "Instagram",
    svg: (
      <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    href: "https://youtube.com",
    label: "YouTube",
    svg: (
      <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" aria-hidden>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    href: "https://t.me",
    label: "Telegram",
    svg: (
      <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" aria-hidden>
        <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 6.498a2.068 2.068 0 0 0 .064 3.867l3.895 1.229 1.489 4.817a.823.823 0 0 0 1.396.315l2.168-2.309 4.067 3.065a2.07 2.07 0 0 0 3.226-1.175l2.968-14.5a2.064 2.064 0 0 0-1.751-2.022zm-3.484 5.362-8.431 5.194-3.298-1.04 11.729-4.154zm-3.847 8.05-.98-3.165 6.309-7.25z" />
      </svg>
    ),
  },
];

function FooterColumn({
  headingKey,
  links,
  loggedIn,
  t,
}: {
  headingKey: TranslationKey;
  links: FooterLink[];
  loggedIn: boolean;
  t: (key: TranslationKey) => string;
}) {
  const visible = links.filter((l) => !l.requiresAuth || loggedIn);
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-disabled">
        {t(headingKey)}
      </div>
      {visible.map((l) => (
        <Link
          key={l.href + l.labelKey}
          href={l.href}
          className="text-[12px] font-medium text-text-muted transition-colors duration-150 hover:text-text sm:text-[13px]"
        >
          {t(l.labelKey)}
        </Link>
      ))}
    </div>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12">

        {/* Main grid: brand full-width on mobile, link columns in 3-col sub-grid, all 4 on lg */}
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.5fr_auto_auto_auto]">

          {/* Brand block */}
          <div className="flex flex-col gap-5">
            <Link
              href="/"
              className="flex w-fit items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
            >
              <div className="h-7 w-7 overflow-hidden rounded-md bg-brand">
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

            <p className="max-w-[28ch] text-[13px] leading-relaxed text-text-muted">
              {t("footerTagline")}
            </p>

            {/* Social icons */}
            <div>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-text-disabled">
                {t("footerFollowUs")}
              </div>
              <div className="flex items-center gap-3">
                {socialLinks.map(({ href, svg, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text-muted transition-colors duration-150 hover:border-border-hover hover:text-text"
                  >
                    {svg}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Link columns: 3-col grid on mobile/tablet, 3 separate cells on lg */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:contents">
            <FooterColumn headingKey="footerBrowse" links={browseLinks} loggedIn={loggedIn} t={t} />
            <FooterColumn headingKey="footerAccount" links={accountLinks} loggedIn={loggedIn} t={t} />
            <FooterColumn headingKey="footerSupport" links={supportLinks} loggedIn={loggedIn} t={t} />
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-border sm:my-8 md:my-10" />

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[12px] text-text-disabled">
            {t("footerCopyright").replace("{year}", String(year))}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
          </div>
        </div>
      </div>
    </footer>
  );
}
