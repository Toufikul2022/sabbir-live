import type { Metadata } from "next";
import { siteConfig } from "./site";

/** Per-page metadata with a canonical URL and matching Open Graph tags. */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: siteConfig.brandName, title: `${title} | ${siteConfig.brandName}`, description, url: path },
    twitter: { card: "summary_large_image", title: `${title} | ${siteConfig.brandName}`, description },
  };
}
