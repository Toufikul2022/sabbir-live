import "server-only";
import { cache } from "react";
import data from "@/content/videos.json";
import { youtubeChannelId } from "./site";
import { fetchFacebookVideos } from "./sync/facebook";
import { fetchYouTubeFeed } from "./sync/youtube";
import { parseVideoUrl, type Orientation, type Platform, type VideoKind } from "./video-url";

/** One record in content/videos.json — only `url` is required. */
export type VideoEntry = {
  url: string;
  title?: string;
  caption?: string;
  thumbnail?: string;
  publishedAt?: string;
  featured?: boolean;
  priority?: number;
  format?: "auto" | "vertical" | "landscape";
  hidden?: boolean;
};

/** A video ready to render. Plain JSON so it can be passed to client components. */
export type Video = {
  key: string;
  platform: Platform;
  id: string | null;
  kind: VideoKind;
  orientation: Orientation;
  watchUrl: string;
  embedUrl: string | null;
  title: string;
  caption: string;
  thumbnail: string | null;
  publishedAt: string | null;
  featured: boolean;
  priority: number;
  source: "manual" | "youtube-feed" | "facebook-api";
};

/** How long oEmbed lookups and synced feeds are cached (seconds). */
export const VIDEO_REVALIDATE = 3600;

const FETCH_TIMEOUT = 6000;

async function fetchJson(url: string): Promise<{ status: number; body: Record<string, unknown> | null }> {
  try {
    const res = await fetch(url, {
      next: { revalidate: VIDEO_REVALIDATE },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      headers: { accept: "application/json" },
    });
    const body = res.ok ? ((await res.json()) as Record<string, unknown>) : null;
    return { status: res.status, body };
  } catch {
    return { status: 0, body: null }; // network error / timeout — treat as "unknown", not "deleted"
  }
}

/**
 * Follows the redirect of a share/short link (fb.watch, facebook.com/share/…,
 * vm.tiktok.com) to find the canonical video URL. Best effort: returns null
 * if the platform doesn't reveal it.
 */
export async function resolveShareUrl(url: string): Promise<string | null> {
  let current = url;
  for (let hop = 0; hop < 5; hop++) {
    let location: string | null;
    try {
      const res = await fetch(current, {
        redirect: "manual",
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
        headers: { "user-agent": "Mozilla/5.0 (compatible; SabbirLIVE-site/1.0)" },
      });
      location = res.headers.get("location");
    } catch {
      return null;
    }
    if (!location) return null;
    const next = new URL(location, current);
    // Facebook sometimes bounces anonymous requests through the login page with ?next=<video url>.
    const loginNext = next.pathname.startsWith("/login") ? next.searchParams.get("next") : null;
    current = loginNext ?? next.toString();
    const parsed = parseVideoUrl(current);
    if (parsed.ok && parsed.id) return current;
  }
  return null;
}

type Enrichment = { title?: string; unavailable?: boolean; noEmbed?: boolean };

export async function enrich(platform: Platform, watchUrl: string): Promise<Enrichment> {
  if (platform === "youtube") {
    const { status, body } = await fetchJson(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watchUrl)}`,
    );
    if (status === 400 || status === 404) return { unavailable: true }; // deleted or private
    if (status === 401 || status === 403) return { noEmbed: true }; // embedding disabled by owner
    return { title: str(body?.title) };
  }
  if (platform === "tiktok") {
    const { status, body } = await fetchJson(`https://www.tiktok.com/oembed?url=${encodeURIComponent(watchUrl)}`);
    if (status === 400 || status === 404) return { unavailable: true };
    return { title: str(body?.title) };
  }
  // Facebook's oEmbed requires an app token, so Facebook titles and thumbnails
  // come from the entry itself or from the Graph API sync.
  return {};
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/** Thumbnails that can be derived from the video ID alone. */
function autoThumb(platform: Platform, id: string | null) {
  if (!id) return null;
  if (platform === "youtube") return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  if (platform === "tiktok") return `/api/tiktok-thumb/${id}`; // always fresh, see that route
  return null;
}

async function fromEntry(entry: VideoEntry): Promise<Video | null> {
  if (!entry?.url || entry.hidden) return null;
  let parsed = parseVideoUrl(entry.url);
  if (!parsed.ok) {
    console.warn(`[videos] Skipping "${entry.url}": ${parsed.error}`);
    return null;
  }
  if (parsed.needsResolve) {
    const resolved = await resolveShareUrl(entry.url);
    const reparsed = resolved ? parseVideoUrl(resolved) : null;
    if (reparsed?.ok) parsed = reparsed;
  }
  const p = parsed;

  const needsLookup = p.id && (p.platform === "tiktok" || !entry.title); // TikTok: also checks the video still exists
  const extra = needsLookup ? await enrich(p.platform, p.watchUrl) : {};
  if (extra.unavailable) {
    console.warn(`[videos] Hiding "${entry.url}": the platform reports it as deleted or private.`);
    return null;
  }

  const orientation: Orientation = entry.format === "vertical" || entry.format === "landscape" ? entry.format : p.orientation;
  const embedUrl = extra.noEmbed || !p.embedUrl ? null : p.platform === "facebook" ? p.embedUrl.replace(/width=\d+/, `width=${orientation === "vertical" ? 400 : 720}`) : p.embedUrl;
  return {
    key: p.id ? `${p.platform}:${p.id}` : `${p.platform}:${entry.url}`,
    platform: p.platform,
    id: p.id,
    kind: p.kind,
    orientation,
    watchUrl: p.watchUrl,
    embedUrl,
    title: entry.title?.trim() || extra.title || "",
    caption: entry.caption?.trim() || "",
    thumbnail: entry.thumbnail?.trim() || autoThumb(p.platform, p.id),
    publishedAt: normalizeDate(entry.publishedAt),
    featured: Boolean(entry.featured),
    priority: Number.isFinite(entry.priority) ? Number(entry.priority) : 0,
    source: "manual",
  };
}

function normalizeDate(v: unknown): string | null {
  if (typeof v !== "string" || !v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Featured first, then display priority (higher first), then newest first. */
function compareVideos(a: Video, b: Video) {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.priority !== b.priority) return b.priority - a.priority;
  return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
}

export const getAllVideos = cache(async (): Promise<Video[]> => {
  const entries = (data as { videos?: VideoEntry[] }).videos ?? [];
  const [manual, ytFeed, fbApi] = await Promise.all([
    Promise.all(entries.map(fromEntry)),
    youtubeChannelId() ? fetchYouTubeFeed(youtubeChannelId()) : Promise.resolve([]),
    fetchFacebookVideos(),
  ]);

  // Manual entries win over synced ones (they can add captions, featured flags…).
  const byKey = new Map<string, Video>();
  for (const v of [...ytFeed, ...fbApi]) byKey.set(v.key, v);
  for (const v of manual) if (v) byKey.set(v.key, v);
  // Hidden manual entries also suppress the synced copy of the same video.
  for (const e of entries) {
    if (!e?.hidden) continue;
    const p = parseVideoUrl(e.url);
    if (p.ok && p.id) byKey.delete(`${p.platform}:${p.id}`);
  }
  return [...byKey.values()].sort(compareVideos);
});

export async function getVideosByPlatform(platform: Platform) {
  return (await getAllVideos()).filter((v) => v.platform === platform);
}

