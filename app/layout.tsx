import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PlayerProvider } from "@/components/PlayerProvider";
import { profileUrl, siteConfig, siteUrl } from "@/lib/site";

const description = `${siteConfig.creatorName}'s official website. ${siteConfig.hero.text}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.brandName} — ${siteConfig.creatorName} | Videos on Facebook, TikTok & YouTube`,
    template: `%s | ${siteConfig.brandName}`,
  },
  description,
  applicationName: siteConfig.brandName,
  authors: [{ name: siteConfig.creatorName }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.brandName,
    title: `${siteConfig.brandName} — ${siteConfig.hero.headline}`,
    description,
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: `${siteConfig.brandName} — ${siteConfig.hero.headline}`, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <PlayerProvider>
          <Header facebookUrl={profileUrl("facebook")} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </PlayerProvider>
      </body>
    </html>
  );
}
