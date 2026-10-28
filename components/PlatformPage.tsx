import { platformMeta } from "@/lib/platforms";
import { siteConfig, siteUrl } from "@/lib/site";
import type { Video } from "@/lib/videos";
import type { Platform } from "@/lib/video-url";
import { PlatformIcon } from "./Icons";
import { JsonLd } from "./JsonLd";
import { ProfileEmbed } from "./ProfileEmbed";
import { container, EmptyState, FollowButton, SectionHeading } from "./ui";
import { VideoGrid } from "./VideoGrid";

const heroGlow: Record<Platform, string> = {
  facebook: "from-facebook/35",
  tiktok: "from-tiktok/25",
  youtube: "from-youtube/25",
};

const verticalTitle: Record<Platform, string> = { facebook: "Reels", tiktok: "Videos", youtube: "Shorts" };
const intro: Record<Platform, string> = {
  facebook: "My main channel. Reels and videos from the Sabbir LIVE Facebook Page — newest first.",
  tiktok: "Short, vertical videos from TikTok — tap any video to watch it here.",
  youtube: "YouTube Shorts and full-length videos from the Sabbir LIVE channel.",
};

export function PlatformPage({ platform, videos }: { platform: Platform; videos: Video[] }) {
  const meta = platformMeta[platform];
  const vertical = videos.filter((v) => v.orientation === "vertical");
  const landscape = videos.filter((v) => v.orientation === "landscape");
  const social = siteConfig.social[platform];
  const handle = "handle" in social ? `@${social.handle}` : null;

  const eligible = videos.filter((v) => v.title && v.thumbnail && v.publishedAt).slice(0, 30);

  return (
    <>
      {eligible.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${siteConfig.brandName} — ${meta.pageTitle}`,
            url: `${siteUrl}${meta.path}`,
            itemListElement: eligible.map((v, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "VideoObject",
                name: v.title,
                description: v.caption || v.title,
                thumbnailUrl: v.thumbnail,
                uploadDate: v.publishedAt,
                url: v.watchUrl,
                ...(v.embedUrl ? { embedUrl: v.embedUrl } : {}),
              },
            })),
          }}
        />
      )}

      <section className="relative overflow-hidden border-b border-white/10">
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${heroGlow[platform]} via-transparent to-transparent`} aria-hidden />
        <div className={`${container} relative flex flex-col gap-6 py-10 sm:py-14 md:flex-row md:items-end md:justify-between`}>
          <div>
            <p className="eyebrow flex items-center gap-2 text-white/80">
              <PlatformIcon platform={platform} className="size-4" />
              {meta.name}
              {handle && <span className="font-semibold tracking-normal normal-case">· {handle}</span>}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{meta.pageTitle}</h1>
            <p className="mt-3 max-w-2xl text-base text-white/80 sm:text-lg">{intro[platform]}</p>
          </div>
          <FollowButton platform={platform} size="lg" className="self-start md:self-auto" />
        </div>
      </section>

      <div className={`${container} pt-10 sm:pt-14`}>
        {videos.length === 0 && <EmptyState platform={platform} />}

        {vertical.length > 0 && (
          <section aria-labelledby="vertical-title">
            <SectionHeading id="vertical-title" title={`Latest ${verticalTitle[platform]}`} eyebrow={`${vertical.length} video${vertical.length === 1 ? "" : "s"}`} />
            <VideoGrid videos={vertical} />
          </section>
        )}

        {landscape.length > 0 && (
          <section aria-labelledby="landscape-title" className={vertical.length ? "pt-16" : ""}>
            <SectionHeading id="landscape-title" title={platform === "youtube" ? "Videos" : "More videos"} eyebrow={`${landscape.length} video${landscape.length === 1 ? "" : "s"}`} />
            <VideoGrid videos={landscape} layout="landscape" pageSize={9} />
          </section>
        )}

        {platform === "tiktok" && (
          <section aria-labelledby="tiktok-feed-title" className="pt-16">
            <SectionHeading id="tiktok-feed-title" title="Straight from TikTok" eyebrow={handle ?? undefined} />
            <ProfileEmbed platform="tiktok" target={siteConfig.social.tiktok.handle} label={`See the latest TikToks from ${handle}`} />
          </section>
        )}

        {platform === "facebook" && siteConfig.social.facebook.pageUrl && (
          <section aria-labelledby="fb-feed-title" className="pt-16">
            <SectionHeading id="fb-feed-title" title="Latest posts from the Page" />
            <ProfileEmbed platform="facebook" target={siteConfig.social.facebook.pageUrl} label="See the latest posts from the Facebook Page" />
          </section>
        )}
      </div>
    </>
  );
}
