"use client";

import { useSyncExternalStore } from "react";

import { getAuthSnapshot, subscribeAuth } from "@/lib/auth/token";

export function useAuth() {
  const loggedIn = useSyncExternalStore(subscribeAuth, getAuthSnapshot, () => false);
  return { loggedIn };
}
