import type { Metadata, Viewport } from "next";
import { Archivo_Black } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * The brand display font is system Arial Black. Archivo Black is loaded here as
 * the reliable cross-platform fallback (exposed as a CSS variable consumed by
 * the Tailwind `display` font stack).
 */
const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shiftora.ai"),
  title: {
    default: "Shiftora AI",
    template: "%s | Shiftora AI",
  },
  description:
    "Shiftora AI. New website coming soon. Custom AI automation and production software for large enterprises across the UAE, India, and the USA.",
  openGraph: {
    title: "Shiftora AI",
    description: "New website coming soon.",
    url: "/",
    siteName: "Shiftora AI",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={archivoBlack.variable}>
      <body>
        <a
          href="#main"
          className="absolute left-4 top-4 z-[100] -translate-y-24 rounded-full bg-black px-5 py-2 text-sm text-white transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <Providers>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
