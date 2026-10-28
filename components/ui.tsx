import Link from "next/link";
import type { ReactNode } from "react";
import { platformMeta } from "@/lib/platforms";
import { followUrl } from "@/lib/site";
import type { Platform } from "@/lib/video-url";
import { ArrowRightIcon, ChevronDownIcon, PlatformIcon } from "./Icons";

export const container = "mx-auto w-full max-w-7xl px-4 sm:px-6";

const followStyles: Record<Platform, string> = {
  facebook: "bg-facebook text-white hover:brightness-110",
  tiktok: "bg-white text-black hover:bg-white/90",
  youtube: "bg-brand-strong text-white hover:brightness-110",
};

export function FollowButton({ platform, size = "md", className = "" }: { platform: Platform; size?: "md" | "lg"; className?: string }) {
  const pad = size === "lg" ? "h-13 px-6 text-base" : "h-11 px-5 text-sm";
  return (
    <a
      href={followUrl(platform)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition ${pad} ${followStyles[platform]} ${className}`}
    >
      <PlatformIcon platform={platform} className="size-5" />
      {platformMeta[platform].follow}
    </a>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  platform,
  action,
}: {
  id?: string;
  eyebrow?: ReactNode;
  title: string;
  platform?: Platform;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 sm:mb-7">
      <div>
        {eyebrow && <p className="eyebrow mb-2 flex items-center gap-2 text-muted">{eyebrow}</p>}
        <h2 id={id} className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {platform && <PlatformIcon platform={platform} className="size-7 shrink-0" />}
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function ViewAllLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex min-h-11 items-center gap-2 font-display text-sm font-bold tracking-wider uppercase hover:text-brand-text">
      {children}
      <ArrowRightIcon className="size-4 transition group-hover:translate-x-1" />
    </Link>
  );
}

/** Centred "SHOW MORE ⌄"-style link from the reference layout. */
export function ShowMoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <div className="mt-8 flex justify-center">
      <Link href={href} className="inline-flex min-h-12 items-center gap-2 px-4 font-display text-lg font-bold tracking-wide uppercase hover:text-brand-text">
        {children}
        <ChevronDownIcon className="size-5 -rotate-90 text-facebook" />
      </Link>
    </div>
  );
}

export function EmptyState({ platform, compact = false }: { platform: Platform; compact?: boolean }) {
  const meta = platformMeta[platform];
  return (
    <div className={`flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-white/15 bg-surface text-center ${compact ? "gap-3 px-5 py-8" : "gap-4 px-6 py-14"}`}>
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-white/5">
        <PlatformIcon platform={platform} className="size-7 text-white/70" />
      </span>
      <div>
        <p className="font-display text-xl font-semibold">New {meta.name} videos are on the way</p>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
          Videos will appear here as soon as they’re added. Meanwhile, catch the latest uploads on {meta.name}.
        </p>
      </div>
      <FollowButton platform={platform} />
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="aspect-[9/16] animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
      ))}
    </div>
  );
}
