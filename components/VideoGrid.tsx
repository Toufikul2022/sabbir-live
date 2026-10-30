"use client";

import { useState } from "react";
import type { Video } from "@/lib/videos";
import { ChevronDownIcon } from "./Icons";
import { LandscapeCard, VideoCard } from "./VideoCard";

/** Portrait (or 16:9) grid with a "Show more" button, as in the reference layout. */
export function VideoGrid({ videos, pageSize = 12, layout = "portrait" }: { videos: Video[]; pageSize?: number; layout?: "portrait" | "landscape" }) {
  const [visible, setVisible] = useState(pageSize);
  const shown = videos.slice(0, visible);
  const remaining = videos.length - shown.length;
  return (
    <>
      <ul
        className={
          layout === "portrait"
            ? "grid grid-cols-2 gap-x-3 gap-y-6 min-[480px]:grid-cols-3 md:grid-cols-4 md:gap-x-4 md:gap-y-8 lg:grid-cols-5 xl:grid-cols-6"
            : "grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {shown.map((v, i) => (
          <li key={v.key}>{layout === "portrait" ? <VideoCard video={v} priority={i < 2} /> : <LandscapeCard video={v} />}</li>
        ))}
      </ul>
      {remaining > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((n) => n + pageSize)}
            className="inline-flex min-h-12 items-center gap-2 px-4 font-display text-lg font-bold tracking-wide uppercase hover:text-brand-text"
          >
            Show more <ChevronDownIcon className="size-5 text-brand" />
            <span className="sr-only">({remaining} more videos)</span>
          </button>
        </div>
      )}
    </>
  );
}
