import type { Metadata } from "next";
import { Newsreader, Caveat, Dancing_Script } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Memories",
  description: "A personal love-story scrapbook.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${caveat.variable} ${dancingScript.variable} h-full`}
    >
      <body className="h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
