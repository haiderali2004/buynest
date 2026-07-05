import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EB_Garamond, Manrope, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthListener } from "@/components/shared/auth-listener";
import { PageViewTracker } from "@/components/shared/page-view-tracker";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BuyNest — Considered clothing, cut for the long run",
    template: "%s · BuyNest",
  },
  description:
    "BuyNest is a premium clothing brand for people who buy fewer, better things — tailored shirts, outerwear, and essentials made to last.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${manrope.variable} ${geistMono.variable}`}>
      <body className="bg-canvas font-sans text-foreground antialiased">
        {children}
        <Toaster />
        <AuthListener />
        <PageViewTracker />
      </body>
    </html>
  );
}
