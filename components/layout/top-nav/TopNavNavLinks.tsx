import { ChevronDown } from "lucide-react";
import Link from "next/link";

import type { NavLink } from "./constants";
import { mobileNavLinkClassName, navLinkClassName } from "./styles";
import { isNavActive } from "./utils";

type TopNavNavLinksProps = {
  links: NavLink[];
  pathname: string;
  label: (key: NavLink["labelKey"]) => string;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function TopNavNavLinks({
  links,
  pathname,
  label,
  variant,
  onNavigate,
}: TopNavNavLinksProps) {
  const className = variant === "desktop" ? navLinkClassName : mobileNavLinkClassName;

  return (
    <nav
      className={
        variant === "desktop"
          ? "hidden min-w-0 items-center gap-0.5 xl:gap-1 xl:flex"
          : "flex flex-col gap-1"
      }
      aria-label={variant === "desktop" ? "Primary" : "Primary mobile"}
    >
      {links.map((link) => {
        const active = isNavActive(pathname, link.href);

        const anchor = (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={className(active)}
            onClick={onNavigate}
          >
            <span className="inline-flex items-center gap-1">
              {label(link.labelKey)}
              {variant === "desktop" && link.hasCaret ? (
                <ChevronDown
                  size={13}
                  className="opacity-70 transition-transform duration-150 group-hover:rotate-180"
                  aria-hidden
                />
              ) : null}
            </span>
          </Link>
        );

        // Desktop: hover/focus dropdown with the category links.
        if (variant === "desktop" && link.dropdown?.length) {
          return (
            <div key={link.href} className="group relative">
              {anchor}
              {/* pt-2 bridges the hover gap between the tab and the panel */}
              <div
                className={[
                  "invisible absolute left-0 top-full z-50 pt-2 opacity-0",
                  "transition-opacity duration-150",
                  "group-hover:visible group-hover:opacity-100",
                  "group-focus-within:visible group-focus-within:opacity-100",
                ].join(" ")}
              >
                <div className="min-w-48 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)]">
                  {link.dropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block whitespace-nowrap px-3.5 py-2 text-[13px] font-medium text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
                      onClick={onNavigate}
                    >
                      {label(item.labelKey)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // Mobile: parent link followed by indented category links.
        if (variant === "mobile" && link.dropdown?.length) {
          return (
            <div key={link.href} className="flex flex-col gap-0.5">
              {anchor}
              <div className="ml-3 flex flex-col gap-0.5 border-l border-border pl-2">
                {link.dropdown.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex min-h-9 items-center rounded-lg px-3 text-[13px] font-medium text-text-muted transition-colors hover:bg-surface hover:text-text"
                    onClick={onNavigate}
                  >
                    {label(item.labelKey)}
                  </Link>
                ))}
              </div>
            </div>
          );
        }

        return anchor;
      })}
    </nav>
  );
}
