import { NextResponse } from "next/server";

// Security headers are set in next.config.ts. This proxy exists so Vercel bundles the app correctly on Next 16.
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
