"use client";

import { useEffect, useState } from "react";
import { TopNavActions } from "./TopNavActions";
import { TopNavLogo } from "./TopNavLogo";
import { TopNavNavLinks } from "./TopNavNavLinks";
import { TopNavSearchForm } from "./TopNavSearchForm";
import { useTopNav } from "./use-top-nav";

export function TopNav() {
  const nav = useTopNav();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "rt-nav-gradient fixed top-0 z-50 w-full overflow-visible transition-shadow duration-400 ease-out",
        scrolled ? "shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]" : "",
      ].join(" ")}
    >
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center gap-3 px-4 sm:gap-4 sm:px-6 md:px-8 lg:gap-5 lg:px-10 xl:px-12">
        <div className="flex min-w-0 shrink-0 items-center gap-4 lg:gap-6 xl:gap-8">
          <TopNavLogo />
          <TopNavNavLinks
            links={nav.visibleLinks}
            pathname={nav.pathname}
            label={nav.t}
            variant="desktop"
          />
        </div>

        <div className="min-w-0 flex-1" aria-hidden />

        <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-2.5">
          <TopNavSearchForm
            searchLabel={nav.t("navSearch")}
            placeholder={nav.t("searchPlaceholder")}
            onSubmit={nav.submitSearch}
            variant="desktop"
          />

          <div className="hidden h-7 w-px shrink-0 bg-white/20 xl:block" aria-hidden />

          <TopNavActions {...nav} />
        </div>
      </div>
    </header>
  );
}
