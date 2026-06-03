"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useAuth } from "@/hooks/auth/use-auth";
import { refreshUserSession } from "@/lib/api/auth";
import { clearToken } from "@/lib/auth/token";
import {
  getServerUserSnapshot,
  getUserSnapshot,
  subscribeUser,
} from "@/lib/user-session";

type UseUserOptions = {
  /** When true (default), refetch profile if logged in but user snapshot is missing. */
  refreshIfMissing?: boolean;
};

export function useUser(options: UseUserOptions = {}) {
  const { refreshIfMissing = true } = options;
  const { loggedIn } = useAuth();
  const user = useSyncExternalStore(
    subscribeUser,
    getUserSnapshot,
    getServerUserSnapshot,
  );

  useEffect(() => {
    if (!refreshIfMissing || !loggedIn || user) return;
    void refreshUserSession().catch(() => clearToken());
  }, [refreshIfMissing, loggedIn, user]);

  return { user };
}
