import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isValidSession, SESSION_COOKIE } from "@/lib/manage/auth";
import { readVideos, writeVideos } from "@/lib/manage/github";
import type { ManagedTikTok } from "@/lib/manage/types";
import { parseVideoUrl } from "@/lib/video-url";
import { enrich, resolveShareUrl, type VideoEntry } from "@/lib/videos";

export const runtime = "nodejs";

const fail = (status: number, message: string) => NextResponse.json({ message }, { status });

async function authorised() {
  return isValidSession((await cookies()).get(SESSION_COOKIE)?.value);
}

function tiktokId(url: string) {
  const p = parseVideoUrl(url);
  return p.ok && p.platform === "tiktok" ? p.id : null;
}

/** TikTok video IDs start with the upload time (seconds since 1970) in their top 32 bits. */
function uploadDateFromId(id: string) {
  const seconds = Number(BigInt(id) >> BigInt(32));
  const date = new Date(seconds * 1000);
  return date.getFullYear() >= 2016 && date.getTime() <= Date.now() + 86_400_000 ? date.toISOString().slice(0, 10) : null;
}

function list(videos: VideoEntry[]): ManagedTikTok[] {
  return videos.flatMap((v) => {
    const id = tiktokId(v.url);
    return id && !v.hidden ? [{ id, url: v.url, title: v.title ?? "", publishedAt: v.publishedAt ?? null, featured: Boolean(v.featured) }] : [];
  });
}

async function run(fn: () => Promise<NextResponse>) {
  if (!(await authorised())) return fail(401, "Please log in again.");
  try {
    return await fn();
  } catch (err) {
    return fail(502, err instanceof Error ? err.message : "Something went wrong.");
  }
}

export function GET() {
  return run(async () => NextResponse.json({ videos: list((await readVideos()).videos) }));
}

/** Add a TikTok by link. Accepts full links and the short links the TikTok app copies. */
export function POST(req: Request) {
  return run(async () => {
    const body = (await req.json().catch(() => ({}))) as { url?: string; title?: string; featured?: boolean };
    let url = (body.url ?? "").trim().match(/https?:\/\/\S+/)?.[0] ?? ""; // tolerate pasted text around the link
    let parsed = parseVideoUrl(url);
    if (!parsed.ok || parsed.platform !== "tiktok") return fail(400, "That doesn’t look like a TikTok video link.");
    if (parsed.needsResolve) {
      const full = await resolveShareUrl(url);
      const reparsed = full ? parseVideoUrl(full) : null;
      if (!reparsed?.ok || !reparsed.id) {
        return fail(400, "Couldn’t open that short link. Open the video in a browser and copy the full address from the address bar.");
      }
      parsed = reparsed;
    }
    const id = parsed.id!;
    url = parsed.watchUrl;

    const info = await enrich("tiktok", url);
    if (info.unavailable) return fail(400, "TikTok says this video is private or deleted.");

    const { videos, sha } = await readVideos();
    if (videos.some((v) => tiktokId(v.url) === id && !v.hidden)) return fail(409, "This video is already on the website.");

    const entry: VideoEntry = {
      url,
      ...(body.title?.trim() || info.title ? { title: body.title?.trim() || info.title } : {}),
      ...(uploadDateFromId(id) ? { publishedAt: uploadDateFromId(id)! } : {}),
      ...(body.featured ? { featured: true } : {}),
    };
    // Drop any earlier hidden copy of the same video, then add the new entry at the top.
    const next = [entry, ...videos.filter((v) => tiktokId(v.url) !== id)];
    await writeVideos(next, sha, `Add TikTok video ${id}`);
    return NextResponse.json({ videos: list(next), added: entry.title || "TikTok video" });
  });
}

/** Toggle "featured". */
export function PATCH(req: Request) {
  return run(async () => {
    const { id, featured } = (await req.json().catch(() => ({}))) as { id?: string; featured?: boolean };
    const { videos, sha } = await readVideos();
    const next = videos.map((v) => (tiktokId(v.url) === id ? { ...v, featured: Boolean(featured) } : v));
    await writeVideos(next, sha, `${featured ? "Feature" : "Unfeature"} TikTok video ${id}`);
    return NextResponse.json({ videos: list(next) });
  });
}

export function DELETE(req: Request) {
  return run(async () => {
    const { id } = (await req.json().catch(() => ({}))) as { id?: string };
    const { videos, sha } = await readVideos();
    const next = videos.filter((v) => tiktokId(v.url) !== id);
    if (next.length === videos.length) return fail(404, "That video wasn’t found.");
    await writeVideos(next, sha, `Remove TikTok video ${id}`);
    return NextResponse.json({ videos: list(next) });
  });
}
