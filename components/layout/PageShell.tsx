import { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { TopNav } from "@/components/layout/top-nav";

export function PageShell({
  children,
  wide = false,
  fullWidth = false,
  footer = false,
}: {
  children: ReactNode;
  wide?: boolean;
  /** No max-width cap — for watch/detail and checkout layouts */
  fullWidth?: boolean;
  /** Render the site footer. Opt-in — currently only the home page. */
  footer?: boolean;
}) {
  const innerClass = fullWidth
    ? "w-full min-w-0"
    : wide
      ? "mx-auto w-full max-w-6xl"
      : "mx-auto w-full max-w-5xl";

  return (
    <div className="flex min-h-full flex-col overflow-x-hidden bg-bg text-text">
      <TopNav />
      <main className="min-w-0 flex-1 pt-16">
        <div className={innerClass}>{children}</div>
      </main>
      {footer ? <SiteFooter /> : null}
    </div>
  );
}
