import Image from "next/image";
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
}: {
  src: string | null;
  alt: string;
  platform: Platform;
  sizes: string;
  priority?: boolean;
}) {
  if (!src) return <Poster platform={platform} />;
  const cls = "absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]";
  if (canOptimize(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} className={cls} priority={priority} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={cls} loading={priority ? "eager" : "lazy"} decoding="async" />;
}

const posterBg: Record<Platform, string> = {
  facebook: "from-facebook/70 via-facebook-deep to-ink",
  tiktok: "from-tiktok/55 via-[#1b0710] to-ink",
  youtube: "from-youtube/55 via-[#1a0306] to-ink",
};

export function Poster({ platform }: { platform: Platform }) {
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b ${posterBg[platform]} p-4`}>
      <PlatformIcon platform={platform} className="size-10 text-white/25" />
      <Image src={logo} alt="" className="h-auto w-3/4 max-w-[180px] opacity-90" sizes="180px" />
    </div>
  );
}
