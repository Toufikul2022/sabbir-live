import type { Metadata } from "next";
import { PlatformPage } from "@/components/PlatformPage";
import { platformMeta } from "@/lib/platforms";
import { pageMetadata } from "@/lib/seo";
import { getVideosByPlatform } from "@/lib/videos";

// Re-check feeds and oEmbed data at most once an hour (keep in sync with VIDEO_REVALIDATE).
export const revalidate = 3600;

const meta = platformMeta.facebook;

export const metadata: Metadata = pageMetadata({ title: meta.pageTitle, description: meta.pageDescription, path: meta.path });

export default async function FacebookPage() {
  return <PlatformPage platform="facebook" videos={await getVideosByPlatform("facebook")} />;
}
