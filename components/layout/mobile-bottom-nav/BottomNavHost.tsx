"use client";

import { useSyncExternalStore } from "react";
import { MobileBottomNav } from "./MobileBottomNav";

function subscribe() {
  return () => {};
}

/** Client-only mount so pathname/locale tab UI never mismatches SSR HTML. */
export function MobileBottomNavHost() {
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  if (!ready) return null;
  return <MobileBottomNav />;
}
