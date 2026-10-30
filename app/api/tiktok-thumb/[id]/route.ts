import { siteConfig } from "@/lib/site";

// TikTok thumbnail links are signed and expire within hours, so the site never
// stores them. This route asks TikTok's oEmbed API for a fresh cover image and
// serves it, cached for six hours at the edge.
const CACHE = "public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{5,25}$/.test(id)) return new Response("Not found", { status: 404 });

  const videoUrl = `https://www.tiktok.com/@${siteConfig.social.tiktok.handle}/video/${id}`;
  let thumb: string | undefined;
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`, {
      next: { revalidate: 21600 },
      signal: AbortSignal.timeout(6000),
    });
    thumb = res.ok ? ((await res.json()) as { thumbnail_url?: string }).thumbnail_url : undefined;
  } catch {
    /* falls through to 404 */
  }
  if (!thumb) return new Response("Not found", { status: 404, headers: { "cache-control": "public, s-maxage=600" } });

  try {
    const img = await fetch(thumb, { signal: AbortSignal.timeout(8000) });
    const type = img.headers.get("content-type") ?? "";
    if (img.ok && type.startsWith("image/")) {
      return new Response(img.body, { headers: { "content-type": type, "cache-control": CACHE } });
    }
  } catch {
    /* TikTok's CDN refused the server: let the visitor's browser load it directly */
  }
  return Response.redirect(thumb, 302);
}
