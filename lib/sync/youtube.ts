import "server-only";
import type { Video } from "../videos";
import { youtubeEmbedUrl } from "../video-url";

const decode = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");

const tag = (xml: string, name: string) => xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1];

/**
 * Reads the channel's public RSS feed (the 15 most recent uploads). No API key
 * or quota needed. Shorts are detected from the /shorts/ link YouTube puts in the feed.
 */
export async function fetchYouTubeFeed(channelId: string): Promise<Video[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.warn(`[youtube] Feed request failed with HTTP ${res.status} — check the channel ID.`);
      return [];
    }
    const xml = await res.text();
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
    return entries.flatMap((entry): Video[] => {
      const id = tag(entry, "yt:videoId");
      if (!id) return [];
      const link = entry.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/)?.[1] ?? "";
      const isShort = link.includes("/shorts/");
      return [
        {
          key: `youtube:${id}`,
          platform: "youtube",
          id,
          kind: isShort ? "short" : "video",
          orientation: isShort ? "vertical" : "landscape",
          watchUrl: isShort ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
          embedUrl: youtubeEmbedUrl(id),
          title: decode(tag(entry, "title") ?? ""),
          caption: decode(tag(entry, "media:description") ?? "").slice(0, 400),
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          publishedAt: tag(entry, "published") ?? null,
          featured: false,
          priority: 0,
          source: "youtube-feed",
        },
      ];
    });
  } catch {
    console.warn("[youtube] Feed unavailable (network error or timeout).");
    return [];
  }
}
