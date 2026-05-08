import { ReactNode } from "react";
import { TopNav } from "./TopNav";

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
    </div>
  );
}

