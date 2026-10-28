"use client";

import { useEffect, useRef, useState } from "react";
import type { Platform } from "@/lib/video-url";
import { PlatformIcon } from "./Icons";

/**
 * Click-to-load official profile widgets: TikTok's creator embed and
 * Facebook's Page Plugin. Nothing is requested from TikTok/Facebook until the
 * visitor asks for it (faster pages, fewer third-party cookies).
 */
export function ProfileEmbed({ platform, target, label }: { platform: Extract<Platform, "tiktok" | "facebook">; target: string; label: string }) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || platform !== "tiktok" || !ref.current) return;
    const s = document.createElement("script");
    s.src = "https://www.tiktok.com/embed.js";
    s.async = true;
    ref.current.appendChild(s);
  }, [active, platform]);

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-white/10 bg-surface px-6 py-10 text-center">
        <PlatformIcon platform={platform} className="size-8" />
        <p className="font-display text-xl font-semibold">{label}</p>
        <p className="max-w-md text-sm text-muted">
          This loads content directly from {platform === "tiktok" ? "TikTok" : "Facebook"}, which may set its own cookies.
        </p>
        <button type="button" onClick={() => setActive(true)} className="mt-1 inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-bold text-black hover:bg-white/90">
          Load from {platform === "tiktok" ? "TikTok" : "Facebook"}
        </button>
      </div>
    );
  }

  if (platform === "facebook") {
    const params = new URLSearchParams({
      href: target,
      tabs: "timeline",
      width: "500",
      height: "720",
      small_header: "false",
      adapt_container_width: "true",
      hide_cover: "false",
      show_facepile: "false",
    });
    return (
      <div className="flex justify-center">
        <iframe
          src={`https://www.facebook.com/plugins/page.php?${params}`}
          title="Latest posts from the Sabbir LIVE Facebook Page"
          width={500}
          height={720}
          className="h-[720px] w-full max-w-[500px] rounded-xl border-0 bg-white"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div ref={ref} className="flex min-h-[400px] justify-center">
      <blockquote
        className="tiktok-embed"
        cite={`https://www.tiktok.com/@${target}`}
        data-unique-id={target}
        data-embed-type="creator"
        style={{ maxWidth: 780, minWidth: 288 }}
      >
        <section>
          <a target="_blank" rel="noopener noreferrer" href={`https://www.tiktok.com/@${target}?refer=creator_embed`}>
            @{target}
          </a>
        </section>
      </blockquote>
    </div>
  );
}
