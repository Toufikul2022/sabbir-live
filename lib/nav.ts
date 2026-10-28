import type { Platform } from "./video-url";

export const NAV: { href: string; label: string; platform?: Platform }[] = [
  { href: "/", label: "Home" },
  { href: "/facebook", label: "Facebook", platform: "facebook" },
  { href: "/tiktok", label: "TikTok", platform: "tiktok" },
  { href: "/youtube", label: "YouTube", platform: "youtube" },
  { href: "/contact", label: "Contact" },
];
