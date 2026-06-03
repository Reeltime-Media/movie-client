import { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { TopNav } from "./TopNav";

export function PageShell({
  children,
  wide = false,
  fullWidth = false,
}: {
  children: ReactNode;
  wide?: boolean;
  /** No max-width cap — for watch/detail and checkout layouts */
  fullWidth?: boolean;
}) {
  const innerClass = fullWidth
    ? "w-full min-w-0"
    : wide
      ? "mx-auto w-full max-w-6xl"
      : "mx-auto w-full max-w-5xl";

  return (
    <div className="flex min-h-full flex-col overflow-x-hidden bg-bg text-text">
      <TopNav />
      <main className="min-w-0 flex-1">
        <div className={innerClass}>{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
