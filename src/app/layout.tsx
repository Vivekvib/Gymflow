import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";

// Both are variable fonts, so no explicit weights are needed. They expose
// CSS variables that globals.css wires into --font-sans / --font-display.
const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body-loaded",
  display: "swap",
});

const displayFont = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-display-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: `Membership, payments, and fitness tracking for ${siteConfig.name}.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
