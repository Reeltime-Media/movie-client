import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Inter, Kantumruy_Pro } from "next/font/google";
import "./globals.css";
import { GoogleAuthProvider } from "./components/GoogleAuthProvider";
import { LocaleProvider } from "./components/LocaleProvider";
import { ThemeInit } from "./components/ThemeInit";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/** Kantumruy Pro — primary Khmer script (Google Fonts). Latin fallback in `globals.css` uses Geist Sans. */
const kantumruy = Kantumruy_Pro({
  variable: "--font-khmer",
  subsets: ["khmer", "latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${inter.variable} ${kantumruy.variable} ${GeistSans.variable} h-full antialiased`}
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
