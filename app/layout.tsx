import type { Metadata } from "next";
import { Inter, Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import { MobileBottomNavHost } from "@/components/layout/mobile-bottom-nav";
import { DevToolsGuard } from "@/components/providers/DevToolsGuard";
import { FavoritesProvider } from "@/components/providers/FavoritesProvider";
import { GoogleAuthProvider } from "@/components/providers/GoogleAuthProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { THEME_LOCALE_BOOTSTRAP } from "@/components/providers/ThemeInit";

// Both are variable fonts — omitting `weight` ships a single variable file per
// family that covers the full weight range (incl. 500), instead of one static
// file per weight.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/** Kantumruy Pro — primary Khmer script (Google Fonts). Latin fallback uses Inter. */
const kantumruy = Kantumruy_Pro({
  variable: "--font-khmer",
  subsets: ["khmer", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reeltime Media",
  description: "Cambodia-focused streaming, bold and cinematic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${kantumruy.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Inline in <head> (not next/script) so theme/locale apply before paint
            without React 19's "script tag in component" client warning. */}
        <script
          dangerouslySetInnerHTML={{ __html: THEME_LOCALE_BOOTSTRAP }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text font-sans">
        <DevToolsGuard />
        <GoogleAuthProvider>
          <LocaleProvider>
            <FavoritesProvider>{children}</FavoritesProvider>
            <MobileBottomNavHost />
          </LocaleProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
