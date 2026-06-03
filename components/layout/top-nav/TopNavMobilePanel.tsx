import type { TopNavState } from "./use-top-nav";
import { TopNavAuthLink } from "./TopNavAuthLink";
import { TopNavLocaleSwitcher } from "./TopNavLocaleSwitcher";
import { TopNavMobileAccount } from "./TopNavMobileAccount";
import { TopNavNavLinks } from "./TopNavNavLinks";
import { TopNavSearchForm } from "./TopNavSearchForm";

type TopNavMobilePanelProps = Pick<
  TopNavState,
  | "pathname"
  | "visibleLinks"
  | "t"
  | "locale"
  | "setLang"
  | "submitSearch"
  | "loggedIn"
  | "user"
  | "isAuthPage"
  | "handleSignOut"
  | "setMobileOpen"
> & {
  onClose: () => void;
};

export function TopNavMobilePanel({
  pathname,
  visibleLinks,
  t,
  locale,
  setLang,
  submitSearch,
  loggedIn,
  user,
  isAuthPage,
  handleSignOut,
  onClose,
}: TopNavMobilePanelProps) {
  const authHref = isAuthPage && pathname === "/login" ? "/register" : "/login";
  const authLabel =
    isAuthPage && pathname === "/login" ? t("navCreateAccount") : t("navSignIn");

  return (
    <>
      <button
        type="button"
        aria-label={t("navCloseMenu")}
        className="fixed inset-0 top-[3.75rem] z-40 bg-black/40 lg:hidden"
        onClick={onClose}
      />
      <div
        id="mobile-nav-panel"
        className="relative z-50 border-t border-border bg-bg lg:hidden"
      >
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 md:px-6">
          <TopNavSearchForm
            searchLabel={t("navSearch")}
            placeholder={t("searchPlaceholder")}
            onSubmit={submitSearch}
            variant="mobile"
          />

          <TopNavNavLinks
            links={visibleLinks}
            pathname={pathname}
            label={t}
            variant="mobile"
            onNavigate={onClose}
          />

          <TopNavLocaleSwitcher
            locale={locale}
            langSwitchLabel={t("langSwitch")}
            englishLabel={t("langEnglish")}
            khmerLabel={t("langKhmer")}
            onSelect={setLang}
            variant="mobile"
          />

          {loggedIn ? (
            <TopNavMobileAccount
              user={user}
              profileLabel={t("navProfile")}
              signOutLabel={t("navSignOut")}
              onNavigate={onClose}
              onSignOut={handleSignOut}
            />
          ) : (
            <TopNavAuthLink
              href={authHref}
              label={authLabel}
              variant="mobile"
              onNavigate={onClose}
            />
          )}
        </div>
      </div>
    </>
  );
}
