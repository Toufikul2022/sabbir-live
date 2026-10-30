"use client";

import Image from "next/image";
import { useState } from "react";
import type { Platform } from "@/lib/video-url";
import { PlatformIcon } from "./Icons";
import logo from "@/public/brand/logo-320.png";

const OPTIMIZABLE = [/^i\.ytimg\.com$/, /\.tiktokcdn\.com$/, /\.tiktokcdn-us\.com$/, /\.fbcdn\.net$/];

function canOptimize(src: string) {
  if (src.startsWith("/api/")) return false; // dynamic images (TikTok covers) are served as-is
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
}: {
  src: string | null;
  alt: string;
  platform: Platform;
  sizes: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  // An image can fail before React hydrates (onError never fires), so also check on mount.
  const checkLoaded = (img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  };
  if (!src || failed) return <Poster platform={platform} />;
  const cls = "absolute inset-0 size-full object-cover transition duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.07]";
  if (canOptimize(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} className={cls} priority={priority} ref={checkLoaded} onError={() => setFailed(true)} />;
  }
  return <img src={src} alt={alt} className={cls} loading={priority ? "eager" : "lazy"} decoding="async" ref={checkLoaded} onError={() => setFailed(true)} />;
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
