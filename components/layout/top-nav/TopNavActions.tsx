import { Menu, Search, X } from "lucide-react";
import Link from "next/link";

import { iconButtonClassName } from "./styles";
import type { TopNavState } from "./use-top-nav";
import { TopNavAccountMenu } from "./TopNavAccountMenu";
import { TopNavAuthLink } from "./TopNavAuthLink";
import { TopNavLocaleSwitcher } from "./TopNavLocaleSwitcher";
import { TopNavThemeToggle } from "./TopNavThemeToggle";

type TopNavActionsProps = Pick<
  TopNavState,
  | "theme"
  | "loggedIn"
  | "user"
  | "locale"
  | "t"
  | "mobileOpen"
  | "setMobileOpen"
  | "accountOpen"
  | "setAccountOpen"
  | "accountRef"
  | "isAuthPage"
  | "pathname"
  | "setLang"
  | "handleSignOut"
>;

export function TopNavActions({
  theme,
  loggedIn,
  user,
  locale,
  t,
  mobileOpen,
  setMobileOpen,
  accountOpen,
  setAccountOpen,
  accountRef,
  isAuthPage,
  pathname,
  setLang,
  handleSignOut,
}: TopNavActionsProps) {
  const authHref = isAuthPage && pathname === "/login" ? "/register" : "/login";
  const authLabel =
    isAuthPage && pathname === "/login" ? t("navCreateAccount") : t("navSignIn");

  return (
    <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
      <TopNavLocaleSwitcher
        locale={locale}
        langSwitchLabel={t("langSwitch")}
        englishLabel={t("langEnglish")}
        khmerLabel={t("langKhmer")}
        onSelect={setLang}
        variant="desktop"
      />

      <TopNavThemeToggle
        theme={theme}
        ariaLabel={theme === "dark" ? t("navThemeToLight") : t("navThemeToDark")}
      />

      <Link
        href="/search"
        className={iconButtonClassName("md:hidden")}
        aria-label={t("navSearch")}
      >
        <Search size={17} aria-hidden />
      </Link>

      {loggedIn ? (
        <TopNavAccountMenu
          accountRef={accountRef}
          accountOpen={accountOpen}
          onToggle={() => setAccountOpen((open) => !open)}
          onClose={() => setAccountOpen(false)}
          onSignOut={handleSignOut}
          user={user}
          menuLabel={t("navAccountMenu")}
          profileLabel={t("navProfile")}
          libraryLabel={t("navMyLibrary")}
          signOutLabel={t("navSignOut")}
        />
      ) : (
        <TopNavAuthLink href={authHref} label={authLabel} variant="desktop" />
      )}

      <button
        type="button"
        className={iconButtonClassName("lg:hidden")}
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav-panel"
        aria-label={mobileOpen ? t("navCloseMenu") : t("navOpenMenu")}
        onClick={() => setMobileOpen((open) => !open)}
      >
        {mobileOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
      </button>
    </div>
  );
}
