"use client";

import { TopNavActions } from "./TopNavActions";
import { TopNavLogo } from "./TopNavLogo";
import { TopNavMobilePanel } from "./TopNavMobilePanel";
import { TopNavNavLinks } from "./TopNavNavLinks";
import { TopNavSearchForm } from "./TopNavSearchForm";
import { useTopNav } from "./use-top-nav";

export function TopNav() {
  const nav = useTopNav();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-bg/90 backdrop-blur-md supports-[backdrop-filter]:bg-bg/80">
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

      {nav.mobileOpen ? (
        <TopNavMobilePanel {...nav} onClose={() => nav.setMobileOpen(false)} />
      ) : null}
    </header>
  );
}
