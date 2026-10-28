import "server-only";
import type { Video } from "../videos";
import { facebookEmbedUrl } from "../video-url";

type GraphVideo = {
  id: string;
  title?: string;
  description?: string;
  created_time?: string;
  permalink_url?: string;
  picture?: string;
  thumbnails?: { data?: { uri: string; width?: number; is_preferred?: boolean }[] };
};

/**
 * Optional: pulls the Page's latest Reels and videos from the Graph API.
 * Only runs when FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN are set.
 */
export async function fetchFacebookVideos(): Promise<Video[]> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) return [];
  const version = process.env.FACEBOOK_GRAPH_VERSION || "v23.0";
  const fields = "id,title,description,created_time,permalink_url,picture,thumbnails{uri,width,is_preferred}";

  const get = async (edge: string): Promise<GraphVideo[]> => {
    const url = `https://graph.facebook.com/${version}/${encodeURIComponent(pageId)}/${edge}?fields=${encodeURIComponent(fields)}&limit=25&access_token=${encodeURIComponent(token)}`;
    try {
      const res = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
      const body = (await res.json()) as { data?: GraphVideo[]; error?: { message?: string } };
      if (!res.ok) {
        console.warn(`[facebook] ${edge}: ${body.error?.message ?? `HTTP ${res.status}`}`);
        return [];
      }
      return body.data ?? [];
    } catch {
      console.warn(`[facebook] ${edge}: request failed (network error or timeout).`);
      return [];
    }
  };

  const [reels, videos] = await Promise.all([get("video_reels"), get("videos")]);
  const seen = new Set<string>();
  const out: Video[] = [];
  for (const [list, fromReels] of [[reels, true], [videos, false]] as const) {
    for (const v of list) {
      if (seen.has(v.id)) continue;
      seen.add(v.id);
      const permalink = v.permalink_url ? new URL(v.permalink_url, "https://www.facebook.com").toString() : "";
      const isReel = fromReels || permalink.includes("/reel/");
      const watchUrl = isReel ? `https://www.facebook.com/reel/${v.id}` : `https://www.facebook.com/watch/?v=${v.id}`;
      const orientation = isReel ? "vertical" : "landscape";
      const thumbs = v.thumbnails?.data ?? [];
      const thumb = thumbs.find((t) => t.is_preferred) ?? [...thumbs].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];
      const text = (v.description ?? "").trim();
      out.push({
        key: `facebook:${v.id}`,
        platform: "facebook",
        id: v.id,
        kind: isReel ? "reel" : "video",
        orientation,
        watchUrl,
        embedUrl: facebookEmbedUrl(watchUrl, orientation),
        title: v.title?.trim() || text.split("\n")[0].slice(0, 120),
        caption: v.title ? text.slice(0, 400) : "",
        thumbnail: thumb?.uri ?? v.picture ?? null,
        publishedAt: v.created_time ? new Date(v.created_time).toISOString() : null,
        featured: false,
        priority: 0,
        source: "facebook-api",
      });
    }
  }
  return out;
}
