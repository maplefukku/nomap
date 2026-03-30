import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { messages, LOCALE_SHORT } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nomap-blue.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: messages.meta.title,
  description: messages.meta.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: messages.meta.title,
    description: messages.meta.description,
    locale: "ja_JP",
    type: "website",
    siteName: "NoMap",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: messages.meta.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: messages.meta.title,
    description: messages.meta.description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={LOCALE_SHORT}
      className={`${inter.variable} ${notoSansJP.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "NoMap",
              url: SITE_URL,
              description: messages.meta.description,
              applicationCategory: "LifestyleApplication",
              operatingSystem: "All",
              inLanguage: "ja",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "JPY",
              },
            }),
          }}
        />
        <a href="#main-content" className="skip-link">
          {messages.layout.skipToMain}
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
