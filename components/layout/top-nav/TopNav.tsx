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

  // Only go transparent at the very top of the home page —
  // other pages may start with light-coloured content behind the nav.
  const transparent = !scrolled && nav.pathname === "/";

  const headerClass = transparent
    ? "border-transparent bg-transparent shadow-none"
    : "rt-glass";

  return (
    <header
      className={[
        "fixed top-0 z-50 w-full border-b transition-all duration-400 ease-out",
        headerClass,
      ].join(" ")}
    >
      <div className="mx-auto flex h-[3.75rem] max-w-7xl items-center gap-3 px-4 sm:gap-4 md:px-6 lg:px-8">
        <TopNavLogo />

        <TopNavNavLinks
          links={nav.visibleLinks}
          pathname={nav.pathname}
          label={nav.t}
          variant="desktop"
        />

        <TopNavSearchForm
          searchLabel={nav.t("navSearch")}
          placeholder={nav.t("searchPlaceholder")}
          onSubmit={nav.submitSearch}
          variant="desktop"
        />

        <TopNavActions {...nav} />
      </div>
    </header>
  );
}
