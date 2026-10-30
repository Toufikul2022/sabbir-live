import Image from "next/image";
import Link from "next/link";
import { HeroPlayButton } from "@/components/HeroPlayButton";
import { ArrowRightIcon, PlatformIcon, PlayIcon } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { Thumb } from "@/components/Thumb";
import { Ticker } from "@/components/Ticker";
import { container, EmptyState, FollowButton, GhostButton, SectionHeading, ShowMoreLink, ViewAllLink } from "@/components/ui";
import { VideoCard, VideoRow } from "@/components/VideoCard";
import { PLATFORM_ORDER, platformMeta } from "@/lib/platforms";
import { profileUrl, siteConfig, siteUrl } from "@/lib/site";
import { getAllVideos, type Video } from "@/lib/videos";
import type { Platform } from "@/lib/video-url";
import logo from "@/public/brand/logo-640.png";

// Re-check feeds and oEmbed data at most once an hour (keep in sync with VIDEO_REVALIDATE).
export const revalidate = 3600;

const railItem = "w-[42vw] max-w-[190px] md:w-auto md:max-w-none";

export default async function HomePage() {
  const all = await getAllVideos();
  const by = (p: Platform) => all.filter((v) => v.platform === p);
  const facebook = by("facebook");
  const tiktok = by("tiktok");
  const youtube = by("youtube");

  // The page opens with the featured video, or else the most recent one from any platform
  // (getAllVideos is already sorted that way). It isn't repeated in the sections below.
  const hero = all[0] ?? null;
  const notHero = (v: Video) => v !== hero;
  const facebookRest = facebook.filter(notHero).slice(0, 12);
  const tiktokLatest = tiktok.filter(notHero).slice(0, 6);
  const ytShorts = youtube.filter((v) => notHero(v) && v.orientation === "vertical").slice(0, 6);
  const ytVideos = youtube.filter((v) => notHero(v) && v.orientation === "landscape").slice(0, 4);
  const counts: Record<Platform, number> = { facebook: facebook.length, tiktok: tiktok.length, youtube: youtube.length };
  const [line1, line2] = splitHeadline(siteConfig.hero.headline);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: siteConfig.brandName, publisher: { "@id": `${siteUrl}/#creator` } },
            {
              "@type": "Person",
              "@id": `${siteUrl}/#creator`,
              name: siteConfig.creatorName,
              alternateName: siteConfig.brandName,
              url: siteUrl,
              sameAs: [siteConfig.social.facebook.pageUrl || profileUrl("facebook"), profileUrl("tiktok"), profileUrl("youtube")],
            },
          ],
        }}
      />

      {/* ─── Hero ─── */}
      <section aria-labelledby="hero-title" className="relative">
        <div className={`${container} pt-6 pb-12 sm:pt-8 sm:pb-14`}>
          <div className="eyebrow flex items-center justify-between gap-4 border-y border-line py-3 text-muted">
            <span className="flex items-center gap-2 text-white">
              <span className="live-dot" aria-hidden /> On air · {siteConfig.creatorName}
            </span>
            <span className="hidden sm:inline">{siteConfig.hero.eyebrow}</span>
          </div>

          <div className="grid items-center gap-8 pt-8 sm:pt-10 lg:grid-cols-[16rem_1fr] lg:gap-16 xl:grid-cols-[17rem_1fr]">
            <HeroFeature video={hero} />

            <div>
              <h1 id="hero-title" className="display text-hero">
                <span className="block overflow-hidden pb-[0.04em]">
                  <span className="rise">{line1}</span>
                </span>
                <span className="block overflow-hidden pb-[0.06em]">
                  <span className="rise text-brand [--rise-delay:120ms]">{line2}</span>
                </span>
              </h1>
              <div className="mt-8 grid gap-8 border-t border-line pt-8 md:grid-cols-[1fr_auto] md:items-end" data-reveal>
                <p className="max-w-md text-lg leading-relaxed text-white/75 sm:text-xl">{siteConfig.hero.text}</p>
                <div className="flex flex-col gap-3 min-[460px]:flex-row">
                  <GhostButton href="#latest">
                    <PlayIcon className="size-4" /> Watch Latest Videos
                  </GhostButton>
                  <FollowButton platform="facebook" size="lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Ticker
        items={[
          "New Reels on Facebook",
          `TikTok @${siteConfig.social.tiktok.handle}`,
          "YouTube Shorts",
          siteConfig.brandName,
          "All my videos · One place",
        ]}
      />

      {/* ─── Platform index (the reference's "ON NOW" schedule row) ─── */}
      <nav id="latest" aria-label="Browse videos by platform" className={`${container} pt-14 sm:pt-20`}>
        <ul className="grid border-y border-line md:grid-cols-3" data-reveal>
          {PLATFORM_ORDER.map((p, i) => (
            <li key={p} className={`border-line ${i > 0 ? "border-t md:border-t-0 md:border-l" : ""}`}>
              <a
                href={`#${p}-videos`}
                className={`group btn-sweep flex h-full items-center gap-5 px-1 py-5 transition-colors duration-300 hover:text-white sm:px-5 sm:py-6 ${i === 0 ? "[--sweep:var(--color-facebook)]" : "[--sweep:var(--color-surface-3)]"}`}
              >
                <span className="display outline-text text-4xl transition group-hover:[-webkit-text-stroke-color:#fff]">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="eyebrow flex items-center gap-2 text-muted group-hover:text-white/80">
                    {i === 0 && <span className="live-dot" aria-hidden />}
                    {i === 0 ? "Main channel" : platformMeta[p].name} · {counts[p] ? `${counts[p]} video${counts[p] === 1 ? "" : "s"}` : "Coming soon"}
                  </span>
                  <span className="display mt-1 block text-2xl">{platformMeta[p].name}</span>
                </span>
                <ArrowRightIcon className="ml-auto size-5 shrink-0 text-brand transition duration-300 group-hover:translate-x-1 group-hover:text-white" />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ─── 01 Facebook (highest priority) ─── */}
      <section aria-labelledby="facebook-videos-title" id="facebook-videos" className={`${container} pt-16 sm:pt-24`}>
        <SectionHeading
          id="facebook-videos-title"
          index={1}
          label={<><PlatformIcon platform="facebook" className="size-3.5 text-facebook" /> Facebook · Main channel</>}
          title={<>Latest <span className="text-facebook">Reels</span></>}
          action={<ViewAllLink href="/facebook">View all</ViewAllLink>}
        />
        {facebookRest.length ? (
          <VideoRail videos={facebookRest} cols="md:grid-cols-4 lg:grid-cols-6" numbered />
        ) : (
          <EmptyState platform="facebook" compact />
        )}
      </section>

      {/* ─── 02 TikTok ─── */}
      <section aria-labelledby="tiktok-videos-title" id="tiktok-videos" className={`${container} pt-16 sm:pt-24`}>
        <SectionHeading
          id="tiktok-videos-title"
          index={2}
          label={<><PlatformIcon platform="tiktok" className="size-3.5" /> TikTok · @{siteConfig.social.tiktok.handle}</>}
          title="On TikTok"
          action={<ViewAllLink href="/tiktok">View all</ViewAllLink>}
        />
        {tiktokLatest.length ? <VideoRail videos={tiktokLatest} cols="md:grid-cols-4 lg:grid-cols-6" /> : <EmptyState platform="tiktok" compact />}
      </section>

      {/* ─── 03 YouTube ─── */}
      <section aria-labelledby="youtube-videos-title" id="youtube-videos" className={`${container} pt-16 sm:pt-24`}>
        <SectionHeading
          id="youtube-videos-title"
          index={3}
          label={<><PlatformIcon platform="youtube" className="size-3.5 text-youtube" /> YouTube · @{siteConfig.social.youtube.handle}</>}
          title="On YouTube"
          action={<ViewAllLink href="/youtube">View all</ViewAllLink>}
        />
        {ytShorts.length === 0 && ytVideos.length === 0 && <EmptyState platform="youtube" compact />}
        {ytShorts.length > 0 && (
          <div data-reveal>
            <h3 className="eyebrow mb-4 text-muted">Shorts</h3>
            <VideoRail videos={ytShorts} cols="md:grid-cols-4 lg:grid-cols-6" />
          </div>
        )}
        {ytVideos.length > 0 && (
          <div data-reveal>
            <h3 className={`eyebrow mb-5 text-muted ${ytShorts.length ? "mt-14" : ""}`}>Latest videos</h3>
            <ul className="grid gap-x-12 lg:grid-cols-2">
              {ytVideos.map((v) => (
                <li key={v.key} className="border-t border-line py-5">
                  <VideoRow video={v} />
                </li>
              ))}
            </ul>
            <ShowMoreLink href="/youtube">Show more</ShowMoreLink>
          </div>
        )}
      </section>

      {/* ─── About ─── */}
      <section aria-labelledby="about-title" className={`${container} pt-20 sm:pt-28`}>
        <div className="grid gap-10 border-t border-line pt-10 md:grid-cols-[14rem_1fr] lg:grid-cols-[18rem_1fr] lg:gap-16" data-reveal>
          <div>
            <p className="eyebrow text-brand-text">About the creator</p>
            <div className="mt-6 hidden border border-line p-6 md:block">
              <Image src={logo} alt="" className="h-auto w-full" sizes="240px" />
            </div>
          </div>
          <div>
            <h2 id="about-title" className="display text-title">
              {siteConfig.about.heading}
            </h2>
            <div className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-white/75">
              {siteConfig.about.paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? "text-xl leading-snug text-white sm:text-2xl" : ""}>
                  {p}
                </p>
              ))}
            </div>
            <Link href="/contact" className="group mt-8 inline-flex items-center gap-3 font-display text-xl font-bold tracking-wide uppercase">
              <span className="link-sweep pb-1">Work with me</span>
              <ArrowRightIcon className="size-5 text-brand transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Follow ─── */}
      <section aria-labelledby="follow-title" className={`${container} pt-20 sm:pt-28`}>
        <SectionHeading id="follow-title" label="Never miss a video" title="Follow along" />
        <ul className="border-b border-line" data-reveal>
          {PLATFORM_ORDER.map((p) => (
            <li key={p} className="border-t border-line">
              <FollowRow platform={p} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function splitHeadline(headline: string): [string, string] {
  const i = headline.indexOf(". ");
  return i === -1 ? [headline, ""] : [headline.slice(0, i + 1), headline.slice(i + 2)];
}

function VideoRail({ videos, cols, numbered = false }: { videos: Video[]; cols: string; numbered?: boolean }) {
  return (
    <ul className={`rail -mx-4 gap-4 px-4 pt-2 md:mx-0 md:grid md:gap-x-4 md:gap-y-8 md:overflow-visible md:px-0 ${cols}`} data-reveal>
      {videos.map((v, i) => (
        <li key={v.key} className={railItem}>
          <VideoCard video={v} index={numbered ? i + 1 : undefined} sizes="(min-width: 1024px) 200px, (min-width: 768px) 24vw, 42vw" />
        </li>
      ))}
    </ul>
  );
}

function HeroFeature({ video }: { video: Video | null }) {
  if (!video) {
    return (
      <div className="mx-auto w-full max-w-[15rem] lg:max-w-none" data-reveal>
        <div className="relative flex aspect-[9/16] flex-col justify-between overflow-hidden border border-line bg-surface p-6">
          <PlatformIcon platform="facebook" className="pointer-events-none absolute -right-10 -bottom-10 size-64 text-facebook/15" />
          <p className="eyebrow relative flex items-center gap-2 text-white">
            <span className="live-dot" aria-hidden /> Facebook first
          </p>
          <div className="relative">
            <Image src={logo} alt="" className="h-auto w-4/5" sizes="280px" priority />
            <p className="display mt-5 text-3xl">New Reels drop on Facebook first.</p>
            <FollowButton platform="facebook" className="mt-6" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="group mx-auto w-full max-w-[15rem] lg:max-w-none" data-reveal>
      <p className="eyebrow mb-3 flex items-center gap-2">
        <span className="live-dot" aria-hidden /> {video.featured ? "Featured" : "Latest"} on {platformMeta[video.platform].name}
      </p>
      <div className="relative aspect-[9/16] overflow-hidden rounded-[var(--radius-card)] bg-surface-2 ring-1 ring-white/15 transition duration-500 group-hover:ring-2 group-hover:ring-brand">
        <Thumb src={video.thumbnail} alt={video.title ? `Thumbnail: ${video.title}` : `Latest ${platformMeta[video.platform].name} video`} platform={video.platform} videoId={video.id} sizes="272px" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" aria-hidden />
        <HeroPlayButton video={video} />
      </div>
      {video.title && <h2 className="mt-3 font-display text-xl leading-tight font-semibold">{video.title}</h2>}
      {video.caption && <p className="mt-1.5 line-clamp-2 text-sm text-muted">{video.caption}</p>}
    </div>
  );
}

const followSweep: Record<Platform, string> = {
  facebook: "[--sweep:var(--color-facebook)]",
  tiktok: "[--sweep:var(--color-tiktok)]",
  youtube: "[--sweep:var(--color-youtube)]",
};

function FollowRow({ platform }: { platform: Platform }) {
  const meta = platformMeta[platform];
  const social = siteConfig.social[platform];
  const handle = "handle" in social ? `@${social.handle}` : siteConfig.brandName;
  return (
    <a
      href={profileUrl(platform)}
      target="_blank"
      rel="noopener noreferrer"
      className={`group btn-sweep flex items-center gap-4 px-1 py-5 transition-colors duration-300 sm:gap-8 sm:px-4 sm:py-6 ${followSweep[platform]}`}
    >
      <PlatformIcon platform={platform} className="size-6 shrink-0 sm:size-8" />
      <span className={`display ${platform === "facebook" ? "text-mega" : "text-[clamp(2.2rem,5.5vw,3.75rem)]"}`}>{meta.name}</span>
      <span className="ml-auto hidden text-right sm:block">
        <span className="eyebrow block text-muted transition-colors group-hover:text-white/85">{platform === "facebook" ? "Main channel" : meta.videoNoun}</span>
        <span className="mt-1 block font-semibold">{handle}</span>
      </span>
      <ArrowRightIcon className="ml-auto size-6 shrink-0 -rotate-45 text-brand transition duration-500 group-hover:rotate-0 group-hover:text-white sm:ml-0 sm:size-7" />
      <span className="sr-only">{meta.follow}</span>
    </a>
  );
}
