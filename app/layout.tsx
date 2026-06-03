import type { Metadata } from "next";
import { Inter, Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import { GoogleAuthProvider } from "@/components/providers/GoogleAuthProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { ThemeInit } from "@/components/providers/ThemeInit";

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
      className={`${inter.variable} ${kantumruy.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg text-text font-sans">
        <ThemeInit />
        <GoogleAuthProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
