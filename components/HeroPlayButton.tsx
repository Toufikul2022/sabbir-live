"use client";

import type { Video } from "@/lib/videos";
import { ExternalIcon, PlayIcon } from "./Icons";
import { usePlayer } from "./PlayerProvider";

/** Full-cover play control for the featured video in the hero. */
export function HeroPlayButton({ video }: { video: Video }) {
  const play = usePlayer();
  const label = video.title || "Latest Facebook Reel";
  const inner = (
    <span className="absolute top-1/2 left-1/2 inline-flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand shadow-[0_0_0_10px_rgb(236_28_36/0.25)] transition group-hover:scale-110">
      {video.embedUrl ? <PlayIcon className="ml-1 size-9" /> : <ExternalIcon className="size-8" />}
    </span>
  );
  const cls = "absolute inset-0 block size-full";
  return video.embedUrl ? (
    <button type="button" className={cls} onClick={() => play(video)} aria-label={`Play: ${label}`}>
      {inner}
    </button>
  ) : (
    <a href={video.watchUrl} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`Watch on Facebook: ${label}`}>
      {inner}
    </a>
  );
}
