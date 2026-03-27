import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nomap-blue.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "NoMap — やりたくないから、地図をつくる",
  description:
    "「やりたくないこと」から、あなたが本当に進みたい方向を見つけるAIツール",
  openGraph: {
    title: "NoMap — やりたくないから、地図をつくる",
    description:
      "「やりたくないこと」から、あなたが本当に進みたい方向を見つけるAIツール",
    locale: "ja_JP",
    type: "website",
    siteName: "NoMap",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "NoMap — やりたくないから、地図をつくる",
    description:
      "「やりたくないこと」から、あなたが本当に進みたい方向を見つけるAIツール",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoSansJP.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="skip-link"
        >
          メインコンテンツへスキップ
        </a>
        <ThemeProvider>
          {children}
          <Toaster richColors position="bottom-center" />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
