import type { Metadata, Viewport } from "next";
import { Noto_Sans_Arabic, Noto_Sans_Hebrew } from "next/font/google";
import { getI18n } from "@/lib/i18n/server";
import "./globals.css";

const notoHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  variable: "--font-he",
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-ar",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.appName,
    description: t.tagline,
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4dc1e5",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { lang } = await getI18n();
  return (
    <html lang={lang} dir="rtl" className={`${notoHebrew.variable} ${notoArabic.variable}`}>
      <body className="decor-bg">{children}</body>
    </html>
  );
}
