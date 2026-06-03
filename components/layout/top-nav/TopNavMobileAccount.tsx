import Link from "next/link";

import { UserAvatar } from "@/components/auth/UserAvatar";
import type { UserRead } from "@/lib/api/types";

type TopNavMobileAccountProps = {
  user: UserRead | null;
  profileLabel: string;
  signOutLabel: string;
  onNavigate: () => void;
  onSignOut: () => void;
};

export function TopNavMobileAccount({
  user,
  profileLabel,
  signOutLabel,
  onNavigate,
  onSignOut,
}: TopNavMobileAccountProps) {
  return (
    <div className="space-y-2 border-t border-border pt-4">
      <div className="flex items-center gap-3 px-1">
        <UserAvatar
          name={user?.full_name}
          email={user?.email}
          avatarUrl={user?.avatar_url}
          size="md"
        />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-text">
            {user?.full_name || user?.email || profileLabel}
          </p>
          {user?.email ? (
            <p className="truncate text-[12px] text-text-muted">{user.email}</p>
          ) : null}
        </div>
      </div>
      <Link
        href="/profile"
        className="flex min-h-11 items-center rounded-lg px-3 text-[15px] font-semibold text-text hover:bg-surface"
        onClick={onNavigate}
      >
        {profileLabel}
      </Link>
      <button
        type="button"
        onClick={onSignOut}
        className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-[15px] font-semibold text-text-muted hover:bg-surface hover:text-text"
      >
        {signOutLabel}
      </button>
    </div>
  );
}
