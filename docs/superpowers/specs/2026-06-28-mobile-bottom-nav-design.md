# Mobile bottom navigation — design

**Date:** 2026-06-28
**Status:** Approved (design)

## Goal

Add an app-style **floating bottom navigation bar** for mobile/tablet, where the
active tab expands into a pill showing its icon + label and inactive tabs collapse
to icon-only. Inspired by a reference mockup (dark rounded pill bar with an
expanding active item). On mobile this **replaces** the current hamburger menu.

Desktop (`lg+`) is unchanged — it keeps the existing top navigation.

## Tabs

Five fixed destinations, all routes already exist:

| Label (i18n key)        | Route         | Icon (lucide) |
| ----------------------- | ------------- | ------------- |
| Home (`navHome`)        | `/`           | `Home`        |
| Movies (`navMovies`)    | `/movies`     | `Film`        |
| Series (`navSeries`)    | `/series`     | `Tv`          |
| Library (`navMyLibrary`)| `/my-library` | `Bookmark`    |
| Profile (`navProfile`)  | `/profile`    | `User`        |

No new translation keys needed — all five keys exist in `en.ts` and `km.ts`.

All five tabs always render (fixed layout, no auth filtering). `Library` and
`Profile` link straight to their routes; the route pages handle the logged-out
case.

## Visual

- **Bar:** fixed to bottom, horizontally centered, `bg-surface` (#141414) with a
  `border-border` hairline, `rounded-full`, internal padding ~6px. Bottom offset
  respects the iOS safe-area inset (`env(safe-area-inset-bottom)`). Flat per the
  brand system — no glow/neumorphism.
- **Inactive tab:** icon only, `text-muted`, ≥44px tap target, hover/active →
  `text` color.
- **Active tab:** expands into a **brand-red pill** (`bg-brand text-white`,
  `rounded-full`) with icon + label. Label animates in (width/opacity, ~200ms
  ease-out). Active state derived from the existing
  `isNavActive(pathname, href)` util.
- Visible only below `lg` (`lg:hidden`).

## Files

**New:**
- `components/layout/mobile-bottom-nav/MobileBottomNav.tsx` — client component.
  Reads `usePathname`, `useI18n` for labels. Renders the bar + tabs.
- `components/layout/mobile-bottom-nav/index.ts` — barrel export.
- (Optional) a small `tabs.ts` config array `{ href, labelKey, Icon }` to keep
  the component focused.

**Modified:**
- `app/layout.tsx` — mount `<MobileBottomNav />` once (inside providers, after
  `{children}`); add bottom padding on the page body for mobile (`pb-24 lg:pb-0`
  or equivalent) so the floating bar never covers content.
- `components/layout/top-nav/TopNavActions.tsx` — remove the hamburger
  `<button>` (and now-unused `Menu`/`X` imports + `mobileOpen`/`setMobileOpen`
  props).
- `components/layout/top-nav/TopNav.tsx` — remove the `<TopNavMobilePanel>`
  render.
- `components/layout/top-nav/use-top-nav.ts` — remove the unused `mobileOpen`
  state and the body-scroll-lock effect tied to it.

**Deleted:**
- `components/layout/top-nav/TopNavMobilePanel.tsx` — no longer used.

> Note: search, language switcher, theme toggle, and the account/avatar menu all
> already live directly in the top bar (independent of the hamburger), so they
> remain reachable on mobile after the panel is removed. The hamburger panel only
> duplicated the nav links, which the bottom bar now provides.

## Out of scope

- No changes to desktop nav.
- No new routes, no backend, no new i18n keys.
- No badges/notification counts on tabs.
