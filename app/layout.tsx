import type { Metadata } from "next";
import type { ReactNode } from "react";
import { EB_Garamond, Manrope, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthListener } from "@/components/shared/auth-listener";
import { PageViewTracker } from "@/components/shared/page-view-tracker";
import { Preloader } from "@/components/shared/preloader";
import { BackToTop } from "@/components/shared/back-to-top";

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
    default: "BuyNest — Supplies for curious minds",
    template: "%s · BuyNest",
  },
  description:
    "BuyNest stocks notebooks, art and craft supplies, science kits, and educational tools for students, teachers, and makers who love to learn by doing.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${ebGaramond.variable} ${manrope.variable} ${geistMono.variable}`}
    >
      <body className="bg-canvas font-sans text-foreground antialiased">
        <NextTopLoader
          color="#24433A"
          height={3}
          shadow={false}
          showSpinner={false}
          easing="ease"
        />
        <Preloader />
        {children}
        <BackToTop />
        <Toaster />
        <AuthListener />
        <PageViewTracker />
      </body>
    </html>
  );
}
