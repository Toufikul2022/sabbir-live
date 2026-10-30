import site from "@/content/site.json";
import type { Platform } from "./video-url";

export const siteConfig = site;

// NEXT_PUBLIC_SITE_URL wins; on Vercel the production domain is detected automatically.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

/** Profile link used by every "Follow" button. */
export function profileUrl(platform: Platform) {
  return site.social[platform].url;
}

/** Link that also opens YouTube's "Subscribe" confirmation. */
export function followUrl(platform: Platform) {
  const url = profileUrl(platform);
  return platform === "youtube" ? `${url}?sub_confirmation=1` : url;
}

export function youtubeChannelId() {
  return process.env.YOUTUBE_CHANNEL_ID || site.social.youtube.channelId || "";
}
