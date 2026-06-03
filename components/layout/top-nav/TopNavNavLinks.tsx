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
          ? "hidden min-w-0 flex-1 items-center gap-1 lg:flex"
          : "flex flex-col gap-1"
      }
      aria-label={variant === "desktop" ? "Primary" : "Primary mobile"}
    >
      {links.map((link) => {
        const active = isNavActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={className(active)}
            onClick={onNavigate}
          >
            {label(link.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
