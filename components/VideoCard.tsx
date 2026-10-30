"use client";

import { platformMeta } from "@/lib/platforms";
import type { Video } from "@/lib/videos";
import { ExternalIcon, PlatformIcon, PlayIcon } from "./Icons";
import { usePlayer } from "./PlayerProvider";
import { Thumb } from "./Thumb";

const KIND_LABEL = { reel: "Reel", short: "Short", video: "Video" } as const;

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
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

const frame =
  "relative overflow-hidden rounded-[var(--radius-card)] bg-surface-2 ring-1 ring-white/10 transition duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1 group-hover:ring-2 group-hover:ring-brand group-hover:shadow-[0_18px_40px_-12px_rgb(236_28_36/0.45)]";

function PlayBadge({ video, size = "md" }: { video: Video; size?: "md" | "lg" }) {
  const dim = size === "lg" ? "size-14" : "size-10";
  return (
    <span
      className={`absolute top-1/2 left-1/2 inline-flex ${dim} -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 ring-1 ring-white/50 backdrop-blur-sm transition duration-500 ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:bg-brand group-hover:ring-brand`}
      aria-hidden
    >
      {video.embedUrl ? <PlayIcon className="ml-0.5 size-4" /> : <ExternalIcon className="size-4" />}
    </span>
  );
}

/** Portrait, Reel-style card (9:16) with the title set underneath. */
export function VideoCard({
  video,
  index,
  sizes = "(min-width: 1024px) 200px, (min-width: 480px) 33vw, 50vw",
  priority = false,
}: {
  video: Video;
  index?: number;
  sizes?: string;
  priority?: boolean;
}) {
  const meta = platformMeta[video.platform];
  const label = video.title || `${meta.name} ${KIND_LABEL[video.kind].toLowerCase()}`;
  const date = formatDate(video.publishedAt);
  return (
    <article className="group">
      <Trigger video={video} label={label} className="block w-full text-left">
        <div className={`${frame} aspect-[9/16]`}>
          <Thumb src={video.thumbnail} alt={video.title ? `Thumbnail: ${video.title}` : `${meta.name} video thumbnail`} platform={video.platform} videoId={video.id} sizes={sizes} priority={priority} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/40" aria-hidden />
          <span className="absolute top-2 left-2 inline-flex size-6 items-center justify-center rounded-sm bg-black/70">
            <PlatformIcon platform={video.platform} className="size-3.5" />
            <span className="sr-only">{meta.name}</span>
          </span>
          {index !== undefined && (
            <span className="display absolute right-2 bottom-1.5 text-3xl text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" aria-hidden>
              {String(index).padStart(2, "0")}
            </span>
          )}
          <span className="eyebrow absolute top-2.5 right-2.5 text-[0.65rem] text-white/85">{KIND_LABEL[video.kind]}</span>
          <PlayBadge video={video} />
        </div>
        <div className="mt-2.5 pr-1">
          {date && <p className="eyebrow text-[0.7rem] text-muted">{date}</p>}
          <h3 className="mt-0.5 line-clamp-2 font-display text-[1.05rem] leading-tight font-semibold">
            <span className="link-sweep">{label}</span>
          </h3>
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
      <Trigger video={video} label={label} className="grid w-full grid-cols-[42%_1fr] items-start gap-4 text-left sm:grid-cols-[14rem_1fr] sm:gap-6">
        <div className={`${frame} aspect-video`}>
          <Thumb src={video.thumbnail} alt={video.title ? `Thumbnail: ${video.title}` : `${meta.name} video thumbnail`} platform={video.platform} videoId={video.id} sizes="(min-width: 640px) 224px, 42vw" />
          <PlayBadge video={video} />
        </div>
        <div className="min-w-0">
          <p className="eyebrow text-[0.7rem] text-muted">
            {meta.name}
            {date && ` · ${date}`}
          </p>
          <h3 className="mt-1.5 line-clamp-3 font-display text-xl leading-tight font-semibold sm:text-2xl">
            <span className="link-sweep">{label}</span>
          </h3>
          {video.caption && <p className="mt-2 hidden text-sm text-muted sm:line-clamp-2">{video.caption}</p>}
        </div>
      </Trigger>
    </article>
  );
}

/** 16:9 grid card for regular videos. */
export function LandscapeCard({ video }: { video: Video }) {
  const meta = platformMeta[video.platform];
  const label = video.title || `${meta.name} video`;
  const date = formatDate(video.publishedAt);
  return (
    <article className="group">
      <Trigger video={video} label={label} className="block w-full text-left">
        <div className={`${frame} aspect-video`}>
          <Thumb src={video.thumbnail} alt={video.title ? `Thumbnail: ${video.title}` : `${meta.name} video thumbnail`} platform={video.platform} videoId={video.id} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />
          <PlayBadge video={video} size="lg" />
        </div>
        {date && <p className="eyebrow mt-3 text-[0.7rem] text-muted">{date}</p>}
        <h3 className="mt-1 line-clamp-2 font-display text-xl leading-tight font-semibold">
          <span className="link-sweep">{label}</span>
        </h3>
      </Trigger>
    </article>
  );
}
