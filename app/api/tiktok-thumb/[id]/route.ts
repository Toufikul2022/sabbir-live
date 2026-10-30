import { siteConfig } from "@/lib/site";

// TikTok's thumbnail links are signed and expire within hours, so the site never
// stores them. This route asks TikTok's official oEmbed API for the current cover
// and sends the visitor's browser to it. Add ?debug=1 to see what TikTok returned.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{5,25}$/.test(id)) return new Response("Not found", { status: 404 });
  const debug = new URL(req.url).searchParams.has("debug");

  const videoUrl = `https://www.tiktok.com/@${siteConfig.social.tiktok.handle}/video/${id}`;
  let status = 0;
  let thumb: string | undefined;
  let error: string | undefined;
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`, {
      ...(debug ? { cache: "no-store" as const } : { next: { revalidate: 3600 } }),
      signal: AbortSignal.timeout(6000),
    });
    status = res.status;
    if (res.ok) thumb = ((await res.json()) as { thumbnail_url?: string }).thumbnail_url;
  } catch (err) {
    error = String(err);
  }

  if (debug) {
    return Response.json({ id, videoUrl, oembedStatus: status, error, thumbnail: thumb ?? null }, { headers: { "cache-control": "no-store" } });
  }
  if (!thumb) return new Response("Not found", { status: 404, headers: { "cache-control": "public, s-maxage=600" } });
  // Cache the redirect for an hour, well within the life of TikTok's signed link.
  return new Response(null, { status: 302, headers: { location: thumb, "cache-control": "public, max-age=600, s-maxage=3600" } });
}
