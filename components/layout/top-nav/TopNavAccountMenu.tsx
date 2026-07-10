import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { RefObject } from "react";

import { UserAvatar } from "@/components/auth/UserAvatar";
import type { UserRead } from "@/lib/api/types";

type TopNavAccountMenuProps = {
  accountRef: RefObject<HTMLDivElement | null>;
  accountOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSignOut: () => void;
  user: UserRead | null;
  menuLabel: string;
  profileLabel: string;
  libraryLabel: string;
  signOutLabel: string;
};

export function TopNavAccountMenu({
  accountRef,
  accountOpen,
  onToggle,
  onClose,
  onSignOut,
  user,
  menuLabel,
  profileLabel,
  libraryLabel,
  signOutLabel,
}: TopNavAccountMenuProps) {
  return (
    <div ref={accountRef} className="relative hidden md:block">
      <button
        type="button"
        onClick={onToggle}
        className={[
          "inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border/80 bg-surface/70 py-1.5 pl-1.5 pr-2.5 transition-colors",
          "hover:border-border-hover hover:bg-surface",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
          accountOpen ? "border-border-hover bg-surface" : "",
        ].join(" ")}
        aria-expanded={accountOpen}
        aria-haspopup="menu"
        aria-label={menuLabel}
      >
        <UserAvatar
          name={user?.full_name}
          email={user?.email}
          avatarUrl={user?.avatar_url}
          size="sm"
        />
        <ChevronDown
          size={14}
          className={[
            "text-text-muted transition-transform",
            accountOpen ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        />
      </button>

      {accountOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[11rem] overflow-hidden rounded-lg border border-border bg-surface py-1"
        >
          <Link
            href="/profile"
            role="menuitem"
            className="block px-3 py-2.5 text-[13px] font-medium text-text transition-colors hover:bg-surface-elevated"
            onClick={onClose}
          >
            {profileLabel}
          </Link>
          <Link
            href="/my-library"
            role="menuitem"
            className="block px-3 py-2.5 text-[13px] font-medium text-text transition-colors hover:bg-surface-elevated"
            onClick={onClose}
          >
            {libraryLabel}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={onSignOut}
            className="block w-full px-3 py-2.5 text-left text-[13px] font-medium text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
          >
            {signOutLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
