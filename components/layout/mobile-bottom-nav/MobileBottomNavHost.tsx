"use client";

import { useEffect, useState } from "react";
import { MobileBottomNav } from "./MobileBottomNav";

/** Mount after hydration so pathname/locale tab UI never mismatches SSR HTML. */
export function MobileBottomNavHost() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;
  return <MobileBottomNav />;
}
