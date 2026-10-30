"use client";

import Image from "next/image";
import { useState } from "react";
import type { Platform } from "@/lib/video-url";
import { PlatformIcon } from "./Icons";
import logo from "@/public/brand/logo-320.png";

const OPTIMIZABLE = [/^i\.ytimg\.com$/, /\.tiktokcdn\.com$/, /\.tiktokcdn-us\.com$/, /\.fbcdn\.net$/];

function canOptimize(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname;
    return OPTIMIZABLE.some((re) => re.test(host));
  } catch {
    return false;
  }
}

/** Fills its (aspect-ratio sized) parent. Falls back to a branded poster when there's no thumbnail. */
export function Thumb({
  src,
  alt,
  platform,
  sizes,
  priority = false,
  videoId = null,
}: {
  src: string | null;
  alt: string;
  platform: Platform;
  sizes: string;
  priority?: boolean;
  /** Lets TikTok cards without a thumbnail show TikTok's own cover. */
  videoId?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  // An image can fail before React hydrates (onError never fires), so also check on mount.
  const checkLoaded = (img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  };
  if ((!src || failed) && platform === "tiktok" && videoId) return <TikTokCover id={videoId} title={alt} />;
  if (!src || failed) return <Poster platform={platform} />;
  const cls = "absolute inset-0 size-full object-cover transition duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.07]";
  if (canOptimize(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} className={cls} priority={priority} ref={checkLoaded} onError={() => setFailed(true)} />;
  }
  return <img src={src} alt={alt} className={cls} loading={priority ? "eager" : "lazy"} decoding="async" ref={checkLoaded} onError={() => setFailed(true)} />;
}

/**
 * TikTok's oEmbed often has no thumbnail, so TikTok cards show the cover frame
 * of TikTok's official embed player instead (all controls off, no autoplay).
 * It's purely visual: clicks go to the card underneath.
 */
function TikTokCover({ id, title }: { id: string; title: string }) {
  const params = "controls=0&progress_bar=0&play_button=0&volume_control=0&fullscreen_button=0&timestamp=0&music_info=0&description=0&rel=0&autoplay=0&native_context_menu=0&closed_caption=0";
  return (
    <div className="absolute inset-0 bg-surface-2">
      <iframe
        src={`https://www.tiktok.com/player/v1/${id}?${params}`}
        title={title}
        loading="lazy"
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full border-0 transition duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.07]"
      />
    </div>
  );
}

const posterBg: Record<Platform, string> = {
  facebook: "from-facebook-deep to-ink",
  tiktok: "from-[#2a0711] to-ink",
  youtube: "from-[#2a0408] to-ink",
};

function Poster({ platform }: { platform: Platform }) {
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b ${posterBg[platform]} p-4`}>
      <PlatformIcon platform={platform} className="size-10 text-white/25" />
      <Image src={logo} alt="" className="h-auto w-3/4 max-w-[180px] opacity-90" sizes="180px" />
    </div>
  );
}
