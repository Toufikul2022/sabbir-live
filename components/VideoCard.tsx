"use client";

import { platformMeta } from "@/lib/platforms";
import type { Video } from "@/lib/videos";
import { ExternalIcon, PlatformIcon, PlayCircleIcon, PlayIcon } from "./Icons";
import { usePlayer } from "./PlayerProvider";
import { Thumb } from "./Thumb";

const KIND_LABEL = { reel: "Reel", short: "Short", video: "Video" } as const;

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Opens the in-page player when the video can be embedded, otherwise links out to the platform. */
function Trigger({ video, label, className, children }: { video: Video; label: string; className: string; children: React.ReactNode }) {
  const play = usePlayer();
  if (video.embedUrl) {
    return (
      <button type="button" onClick={() => play(video)} aria-label={`Play: ${label}`} className={className}>
        {children}
      </button>
    );
  }
  return (
    <a href={video.watchUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch on ${platformMeta[video.platform].name}: ${label}`} className={className}>
      {children}
    </a>
  );
}

/** Portrait, Reel-style card (9:16). */
export function VideoCard({ video, sizes = "(min-width: 1024px) 260px, (min-width: 640px) 33vw, 50vw", priority = false }: { video: Video; sizes?: string; priority?: boolean }) {
  const meta = platformMeta[video.platform];
  const label = video.title || `${meta.name} ${KIND_LABEL[video.kind].toLowerCase()}`;
  const date = formatDate(video.publishedAt);
  return (
    <article className="group relative">
      <Trigger video={video} label={label} className="block w-full text-left">
        <div className={`relative overflow-hidden rounded-[var(--radius-card)] bg-surface-2 ring-1 ring-white/10 transition group-hover:ring-white/30 aspect-[9/16]`}>
          <Thumb src={video.thumbnail} alt={video.title ? `Thumbnail: ${video.title}` : `${meta.name} video thumbnail`} platform={video.platform} sizes={sizes} priority={priority} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/30" aria-hidden />
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[0.7rem] font-bold backdrop-blur-sm">
            <PlatformIcon platform={video.platform} className="size-3.5" />
            {meta.name}
          </span>
          <span className="eyebrow absolute top-3 right-3 text-[0.65rem] text-white/80">{KIND_LABEL[video.kind]}</span>
          <span className="absolute top-1/2 left-1/2 inline-flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition group-hover:scale-110 group-hover:bg-brand" aria-hidden>
            {video.embedUrl ? <PlayIcon className="ml-0.5 size-6" /> : <ExternalIcon className="size-5" />}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-3">
            {video.title && <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-white">{video.title}</h3>}
            {date && <p className="mt-1 text-xs text-white/70">{date}</p>}
          </div>
        </div>
      </Trigger>
    </article>
  );
}

/** Landscape row, modelled on the reference "Latest" list (thumbnail left, title right). */
export function VideoRow({ video }: { video: Video }) {
  const meta = platformMeta[video.platform];
  const label = video.title || `${meta.name} video`;
  const date = formatDate(video.publishedAt);
  return (
    <article className="group">
      <Trigger video={video} label={label} className="grid w-full grid-cols-[42%_1fr] items-start gap-4 text-left sm:grid-cols-[15rem_1fr]">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-2 ring-1 ring-white/10">
          <Thumb src={video.thumbnail} alt={video.title ? `Thumbnail: ${video.title}` : `${meta.name} video thumbnail`} platform={video.platform} sizes="(min-width: 640px) 240px, 42vw" />
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 text-sm font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            <PlayCircleIcon className="size-5" />
            {meta.name}
          </span>
        </div>
        <div className="min-w-0 pt-0.5">
          <h3 className="line-clamp-3 font-display text-base leading-snug font-semibold group-hover:underline sm:text-lg">{label}</h3>
          {video.caption && <p className="mt-1.5 hidden text-sm text-muted sm:line-clamp-2">{video.caption}</p>}
          {date && <p className="mt-1.5 text-xs text-muted">{date}</p>}
        </div>
      </Trigger>
    </article>
  );
}

/** 16:9 grid card for regular YouTube videos. */
export function LandscapeCard({ video }: { video: Video }) {
  const meta = platformMeta[video.platform];
  const label = video.title || `${meta.name} video`;
  const date = formatDate(video.publishedAt);
  return (
    <article className="group">
      <Trigger video={video} label={label} className="block w-full text-left">
        <div className="relative aspect-video overflow-hidden rounded-[var(--radius-card)] bg-surface-2 ring-1 ring-white/10 transition group-hover:ring-white/30">
          <Thumb src={video.thumbnail} alt={video.title ? `Thumbnail: ${video.title}` : `${meta.name} video thumbnail`} platform={video.platform} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />
          <span className="absolute top-1/2 left-1/2 inline-flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 backdrop-blur-md transition group-hover:scale-110 group-hover:bg-brand" aria-hidden>
            <PlayIcon className="ml-0.5 size-6" />
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 font-display text-lg leading-snug font-semibold group-hover:underline">{label}</h3>
        {date && <p className="mt-1 text-xs text-muted">{date}</p>}
      </Trigger>
    </article>
  );
}
