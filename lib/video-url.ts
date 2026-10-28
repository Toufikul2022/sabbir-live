// Parses a Facebook, TikTok or YouTube video URL into its platform, ID,
// orientation and official embed URL. Pure and dependency-free so it can be
// used by the site, the content checker script and the tests alike.

export type Platform = "facebook" | "tiktok" | "youtube";
export type Orientation = "vertical" | "landscape";
export type VideoKind = "reel" | "short" | "video";

export type ParsedVideoUrl =
  | {
      ok: true;
      platform: Platform;
      /** Platform video ID, or null for share links that still need resolving. */
      id: string | null;
      kind: VideoKind;
      orientation: Orientation;
      /** Clean URL used for "Watch on …" links. */
      watchUrl: string;
      /** Official embed player URL, or null if the link can't be embedded as-is. */
      embedUrl: string | null;
      /** True for short/share links (fb.watch, vm.tiktok.com…) that redirect to the real video. */
      needsResolve: boolean;
    }
  | { ok: false; error: string };

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const DIGITS = /^\d{5,25}$/;

function hostOf(u: URL) {
  return u.hostname.toLowerCase().replace(/^(www|m|mobile|web|mbasic)\./, "");
}

export function youtubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`;
}

export function tiktokEmbedUrl(id: string) {
  return `https://www.tiktok.com/player/v1/${id}?autoplay=1&rel=0&description=1&music_info=1`;
}

export function facebookEmbedUrl(href: string, orientation: Orientation) {
  const width = orientation === "vertical" ? 400 : 720;
  const params = new URLSearchParams({ href, show_text: "false", autoplay: "true", width: String(width) });
  return `https://www.facebook.com/plugins/video.php?${params}`;
}

function youtube(u: URL): ParsedVideoUrl {
  const host = hostOf(u);
  const parts = u.pathname.split("/").filter(Boolean);
  let id: string | null = null;
  let kind: VideoKind = "video";

  if (host === "youtu.be") {
    id = parts[0] ?? null;
  } else if (parts[0] === "watch") {
    id = u.searchParams.get("v");
  } else if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live" || parts[0] === "v") {
    id = parts[1] ?? null;
    if (parts[0] === "shorts") kind = "short";
  }
  if (!id || !YT_ID.test(id)) {
    return { ok: false, error: "Couldn't find a YouTube video ID. Use a link like https://www.youtube.com/watch?v=… or https://www.youtube.com/shorts/…" };
  }
  const orientation: Orientation = kind === "short" ? "vertical" : "landscape";
  return {
    ok: true,
    platform: "youtube",
    id,
    kind,
    orientation,
    watchUrl: kind === "short" ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
    embedUrl: youtubeEmbedUrl(id),
    needsResolve: false,
  };
}

function tiktok(u: URL): ParsedVideoUrl {
  const host = hostOf(u);
  if (host === "vm.tiktok.com" || host === "vt.tiktok.com" || (host === "tiktok.com" && u.pathname.startsWith("/t/"))) {
    return {
      ok: true,
      platform: "tiktok",
      id: null,
      kind: "video",
      orientation: "vertical",
      watchUrl: u.toString(),
      embedUrl: null,
      needsResolve: true,
    };
  }
  // https://www.tiktok.com/@user/video/1234567890 or m.tiktok.com/v/1234567890.html
  const m = u.pathname.match(/^\/@([^/]+)\/video\/(\d+)/) ?? u.pathname.match(/^\/v\/(\d+)(?:\.html)?/);
  const id = m ? m[m.length - 1] : null;
  if (!id || !DIGITS.test(id)) {
    return { ok: false, error: "Couldn't find a TikTok video ID. Use a link like https://www.tiktok.com/@user/video/1234567890" };
  }
  const user = u.pathname.match(/^\/@([^/]+)/)?.[1];
  return {
    ok: true,
    platform: "tiktok",
    id,
    kind: "video",
    orientation: "vertical",
    watchUrl: user ? `https://www.tiktok.com/@${user}/video/${id}` : `https://www.tiktok.com/video/${id}`,
    embedUrl: tiktokEmbedUrl(id),
    needsResolve: false,
  };
}

function facebook(u: URL): ParsedVideoUrl {
  const host = hostOf(u);
  const parts = u.pathname.split("/").filter(Boolean);

  // Share/short links redirect to the real video and can't be embedded directly.
  if (host === "fb.watch" || (parts[0] === "share" && ["v", "r"].includes(parts[1] ?? ""))) {
    return {
      ok: true,
      platform: "facebook",
      id: null,
      kind: parts[1] === "r" ? "reel" : "video",
      orientation: parts[1] === "v" ? "landscape" : "vertical",
      watchUrl: u.toString(),
      embedUrl: null,
      needsResolve: true,
    };
  }

  let id: string | null = null;
  let kind: VideoKind = "video";
  if (parts[0] === "reel" || parts[0] === "reels") {
    id = parts[1] ?? null;
    kind = "reel";
  } else if (parts[0] === "watch") {
    id = u.searchParams.get("v");
  } else {
    // /{page}/videos/{id}, /{page}/videos/{slug}/{id}, /videos/{id}
    const i = parts.indexOf("videos");
    if (i !== -1) id = parts.slice(i + 1).find((p) => DIGITS.test(p)) ?? null;
  }
  if (!id || !DIGITS.test(id)) {
    return { ok: false, error: "Couldn't find a Facebook video ID. Use a link like https://www.facebook.com/reel/123… or https://www.facebook.com/watch/?v=123…" };
  }
  const orientation: Orientation = kind === "reel" ? "vertical" : "landscape";
  const watchUrl = kind === "reel" ? `https://www.facebook.com/reel/${id}` : `https://www.facebook.com/watch/?v=${id}`;
  return {
    ok: true,
    platform: "facebook",
    id,
    kind,
    orientation,
    watchUrl,
    embedUrl: facebookEmbedUrl(watchUrl, orientation),
    needsResolve: false,
  };
}

export function parseVideoUrl(input: string): ParsedVideoUrl {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return { ok: false, error: "Not a valid URL." };
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return { ok: false, error: "Not a web URL." };
  const host = hostOf(u);
  if (host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com" || host === "music.youtube.com") return youtube(u);
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return tiktok(u);
  if (host === "facebook.com" || host === "fb.watch" || host === "fb.com") return facebook(u);
  return { ok: false, error: "Only Facebook, TikTok and YouTube links are supported." };
}
