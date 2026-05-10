import Link from "next/link";
import { ReactNode } from "react";
import { TopNav } from "./TopNav";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "Series", href: "/series" },
  { label: "My library", href: "/my-library" },
  { label: "Profile", href: "/profile" },
] as const;

function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bg">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 md:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
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
              Cambodia&apos;s home for cinema.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-[12px] font-medium text-text-muted transition-colors hover:text-text"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-[11px] text-text-disabled">
          <span>© {new Date().getFullYear()} Reeltime Media. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="#" className="transition-colors hover:text-text-muted">Privacy</Link>
            <Link href="#" className="transition-colors hover:text-text-muted">Terms</Link>
            <Link href="#" className="transition-colors hover:text-text-muted">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-full flex-col bg-bg text-text">
      <TopNav />
      <main className="flex-1">
        <div className={wide ? "mx-auto w-full max-w-6xl" : "mx-auto w-full max-w-5xl"}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
