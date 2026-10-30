import Link from "next/link";
import type { ReactNode } from "react";
import { platformMeta } from "@/lib/platforms";
import { followUrl } from "@/lib/site";
import type { Platform } from "@/lib/video-url";
import { ArrowRightIcon, PlatformIcon } from "./Icons";

export const container = "mx-auto w-full max-w-7xl px-4 sm:px-6";

// Base colour + the colour that sweeps in on hover.
const followStyles: Record<Platform, string> = {
  facebook: "bg-facebook text-white [--sweep:#ffffff] hover:text-black",
  tiktok: "bg-white text-black [--sweep:var(--color-tiktok)] hover:text-white",
  youtube: "bg-brand-strong text-white [--sweep:#ffffff] hover:text-black",
};

export function FollowButton({ platform, size = "md", className = "" }: { platform: Platform; size?: "md" | "lg"; className?: string }) {
  const pad = size === "lg" ? "h-13 px-7 text-base" : "h-11 px-5 text-sm";
  return (
    <a
      href={followUrl(platform)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-sweep inline-flex items-center justify-center gap-2.5 rounded-full font-semibold whitespace-nowrap transition-colors duration-300 ${pad} ${followStyles[platform]} ${className}`}
    >
      <PlatformIcon platform={platform} className="size-5" />
      {platformMeta[platform].follow}
    </a>
  );
}

/** Ghost button with a white fill sweep. */
export function GhostButton({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`btn-sweep inline-flex h-13 items-center justify-center gap-2.5 rounded-full px-7 text-base font-semibold text-white ring-1 ring-white/40 transition-colors duration-300 [--sweep:#ffffff] ring-inset hover:text-black ${className}`}
    >
      {children}
    </a>
  );
}

/**
 * Editorial section heading: outlined index number, mono label, condensed title,
 * and a hairline rule running to the action link.
 */
export function SectionHeading({
  id,
  index,
  label,
  title,
  action,
  as: Tag = "h2",
}: {
  id?: string;
  index?: number;
  label?: ReactNode;
  title: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-6 sm:mb-8" data-reveal>
      <div className="mb-3 flex items-center gap-4">
        {label && <p className="eyebrow flex shrink-0 items-center gap-2 text-muted">{label}</p>}
        <span className="h-px flex-1 bg-line" aria-hidden />
        {action}
      </div>
      <div className="flex items-end gap-4">
        {index !== undefined && (
          <span className="display outline-text hidden text-title sm:block" aria-hidden>
            {String(index).padStart(2, "0")}
          </span>
        )}
        <Tag id={id} className="display text-title">
          {title}
        </Tag>
      </div>
    </div>
  );
}

export function ViewAllLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group eyebrow inline-flex min-h-11 shrink-0 items-center gap-2 text-white">
      <span className="link-sweep pb-0.5">{children}</span>
      <ArrowRightIcon className="size-4 text-brand transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

/** Big "SHOW MORE" link from the reference layout. */
export function ShowMoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <div className="mt-10 flex justify-center border-t border-line pt-6">
      <Link href={href} className="group display inline-flex min-h-12 items-center gap-3 text-2xl tracking-wide">
        <span className="link-sweep pb-1">{children}</span>
        <ArrowRightIcon className="size-5 text-brand transition-transform duration-300 group-hover:translate-x-1.5" />
      </Link>
    </div>
  );
}

const emptyCopy: Record<Platform, string> = {
  facebook: "Fresh Reels land on Facebook first. Follow the Page so you see them the moment they go live.",
  tiktok: "The newest TikToks will show up here. Until then, the full feed is one tap away.",
  youtube: "New Shorts and uploads will show up here. Subscribe so you don’t miss the next one.",
};

export function EmptyState({ platform, compact = false }: { platform: Platform; compact?: boolean }) {
  const meta = platformMeta[platform];
  return (
    <div
      data-reveal
      className={`relative grid items-center gap-6 overflow-hidden border border-line bg-surface sm:grid-cols-[1fr_auto] ${compact ? "p-6 sm:p-8" : "p-8 sm:p-12"}`}
    >
      <PlatformIcon platform={platform} className="pointer-events-none absolute -right-6 -bottom-8 size-44 text-white/[0.04]" />
      <div className="relative">
        <p className="eyebrow flex items-center gap-2 text-brand-text">
          <span className="live-dot" aria-hidden /> Up next on {meta.name}
        </p>
        <p className="mt-3 max-w-xl text-lg text-white/80">{emptyCopy[platform]}</p>
      </div>
      <FollowButton platform={platform} className="relative justify-self-start" />
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 min-[480px]:grid-cols-3 md:grid-cols-4 md:gap-x-4 md:gap-y-8 lg:grid-cols-5 xl:grid-cols-6" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="aspect-[9/16] animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
      ))}
    </div>
  );
}
