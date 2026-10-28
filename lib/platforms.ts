import type { Platform } from "./video-url";

export const PLATFORM_ORDER: Platform[] = ["facebook", "tiktok", "youtube"];

export const platformMeta: Record<
  Platform,
  { name: string; path: string; videoNoun: string; follow: string; pageTitle: string; pageDescription: string }
> = {
  facebook: {
    name: "Facebook",
    path: "/facebook",
    videoNoun: "Reels & videos",
    follow: "Follow on Facebook",
    pageTitle: "Facebook Reels & Videos",
    pageDescription: "Watch the latest Facebook Reels and videos from Sabbir LIVE.",
  },
  tiktok: {
    name: "TikTok",
    path: "/tiktok",
    videoNoun: "TikToks",
    follow: "Follow on TikTok",
    pageTitle: "TikTok Videos",
    pageDescription: "Watch the latest TikTok videos from Sabbir LIVE.",
  },
  youtube: {
    name: "YouTube",
    path: "/youtube",
    videoNoun: "Shorts & videos",
    follow: "Subscribe on YouTube",
    pageTitle: "YouTube Shorts & Videos",
    pageDescription: "Watch the latest YouTube Shorts and videos from Sabbir LIVE.",
  },
};
