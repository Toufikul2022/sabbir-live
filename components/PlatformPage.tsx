import { platformMeta } from "@/lib/platforms";
import { siteConfig, siteUrl } from "@/lib/site";
import type { Video } from "@/lib/videos";
import type { Platform } from "@/lib/video-url";
import { PlatformIcon } from "./Icons";
import { JsonLd } from "./JsonLd";
import { ProfileEmbed } from "./ProfileEmbed";
import { container, EmptyState, FollowButton, SectionHeading } from "./ui";
import { VideoGrid } from "./VideoGrid";

const heroIcon: Record<Platform, string> = {
  facebook: "text-facebook/[0.12]",
  tiktok: "text-tiktok/[0.10]",
  youtube: "text-youtube/[0.10]",
};
const accent: Record<Platform, string> = { facebook: "text-facebook", tiktok: "text-tiktok", youtube: "text-brand" };

const verticalTitle: Record<Platform, string> = { facebook: "Reels", tiktok: "Videos", youtube: "Shorts" };
const intro: Record<Platform, string> = {
  facebook: "My main channel. Every Reel and video from the Sabbir LIVE Page, newest first.",
  tiktok: "Quick, vertical and straight from the phone. Tap any clip to watch it right here.",
  youtube: "Shorts up top, longer videos below. All from the Sabbir LIVE channel.",
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

      <section className="relative overflow-hidden">
        <PlatformIcon platform={platform} className={`pointer-events-none absolute -top-10 -right-16 size-[22rem] sm:size-[30rem] ${heroIcon[platform]}`} />
        <div className={`${container} relative pt-6 pb-10 sm:pt-10 sm:pb-14`}>
          <div className="eyebrow flex items-center justify-between gap-4 border-y border-line py-3 text-muted">
            <span className="flex items-center gap-2 text-white">
              <PlatformIcon platform={platform} className="size-3.5" /> {meta.name}
            </span>
            {handle && <span>{handle}</span>}
          </div>
          <h1 className="display mt-8 text-hero sm:mt-12">
            <span className="block overflow-hidden pb-[0.05em]">
              <span className="rise">{meta.name}</span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span className={`rise [--rise-delay:120ms] ${accent[platform]}`}>{verticalTitle[platform]}</span>
            </span>
          </h1>
          <div className="mt-8 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-end md:justify-between" data-reveal>
            <p className="max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl">{intro[platform]}</p>
            <FollowButton platform={platform} size="lg" className="self-start md:self-auto" />
          </div>
        </div>
      </section>

      <div className={`${container} pt-6 sm:pt-10`}>
        {videos.length === 0 && <EmptyState platform={platform} />}

        {vertical.length > 0 && (
          <section aria-labelledby="vertical-title">
            <SectionHeading id="vertical-title" index={1} title={`Latest ${verticalTitle[platform]}`} label={`${vertical.length} video${vertical.length === 1 ? "" : "s"} · newest first`} />
            <VideoGrid videos={vertical} />
          </section>
        )}

        {landscape.length > 0 && (
          <section aria-labelledby="landscape-title" className={vertical.length ? "pt-16" : ""}>
            <SectionHeading id="landscape-title" index={vertical.length ? 2 : 1} title={platform === "youtube" ? "Full videos" : "More videos"} label={`${landscape.length} video${landscape.length === 1 ? "" : "s"}`} />
            <VideoGrid videos={landscape} layout="landscape" pageSize={9} />
          </section>
        )}

        {platform === "tiktok" && (
          <section aria-labelledby="tiktok-feed-title" className="pt-16">
            <SectionHeading id="tiktok-feed-title" title="Straight from TikTok" label={handle ?? undefined} />
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
