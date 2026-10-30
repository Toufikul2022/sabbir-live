import type { SVGProps } from "react";
import type { Platform } from "@/lib/video-url";

type P = SVGProps<SVGSVGElement>;
const base = { "aria-hidden": true, focusable: false } as const;

export const FacebookIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base} {...p}>
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
  </svg>
);

export const TikTokIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base} {...p}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .59.04.86.13V9.4a6.84 6.84 0 0 0-.86-.05A6.33 6.33 0 0 0 3.15 15.7a6.34 6.34 0 0 0 10.86 4.43 6.3 6.3 0 0 0 1.81-4.43V8.73a8.16 8.16 0 0 0 4.77 1.52V6.81a4.85 4.85 0 0 1-1-.12Z" />
  </svg>
);

export const YouTubeIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base} {...p}>
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
  </svg>
);

export const PlayIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...base} {...p}>
    <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.1-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
  </svg>
);

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const MenuIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...base} {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...base} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
export const ArrowRightIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const ChevronDownIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const ExternalIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...base} {...p}>
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);
export const MailIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...base} {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...base} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const AlertIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...base} {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

export function PlatformIcon({ platform, ...p }: P & { platform: Platform }) {
  if (platform === "facebook") return <FacebookIcon {...p} />;
  if (platform === "tiktok") return <TikTokIcon {...p} />;
  return <YouTubeIcon {...p} />;
}
