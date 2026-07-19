"use client";

import { useSyncExternalStore } from "react";
import { MobileBottomNav } from "./MobileBottomNav";

function subscribe() {
  return () => {};
}

/** true after hydration; false during SSR / first server snapshot. */
function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/** Client-only mount so pathname/locale tab UI never mismatches SSR HTML. */
export function MobileBottomNavHost() {
  const ready = useIsClient();
  if (!ready) return null;
  return <MobileBottomNav />;
}
