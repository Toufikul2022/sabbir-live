import Image from "next/image";
import Link from "next/link";
import { PlatformIcon, PlayIcon } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { SocialIcons } from "@/components/SocialIcons";
import { Thumb } from "@/components/Thumb";
import { container, EmptyState, FollowButton, SectionHeading, ShowMoreLink, ViewAllLink } from "@/components/ui";
import { VideoCard, VideoRow } from "@/components/VideoCard";
import { HeroPlayButton } from "@/components/HeroPlayButton";
import { PLATFORM_ORDER, platformMeta } from "@/lib/platforms";
import { profileUrl, siteConfig, siteUrl } from "@/lib/site";
import { getAllVideos, type Video } from "@/lib/videos";
import type { Platform } from "@/lib/video-url";
import logo from "@/public/brand/logo-640.png";

// Re-check feeds and oEmbed data at most once an hour (keep in sync with VIDEO_REVALIDATE).
export const revalidate = 3600;

const railItem = "w-[62vw] max-w-[250px] md:w-auto md:max-w-none";

export default async function HomePage() {
  const all = await getAllVideos();
  const by = (p: Platform) => all.filter((v) => v.platform === p);
  const facebook = by("facebook");
  const tiktok = by("tiktok");
  const youtube = by("youtube");

  // Facebook is the primary platform: its featured (or newest) video leads the page.
  const hero = facebook.find((v) => v.featured) ?? facebook[0] ?? null;
  const facebookRest = facebook.filter((v) => v !== hero).slice(0, 8);
  const tiktokLatest = tiktok.slice(0, 6);
  const ytShorts = youtube.filter((v) => v.orientation === "vertical").slice(0, 6);
  const ytVideos = youtube.filter((v) => v.orientation === "landscape").slice(0, 4);
  const counts: Record<Platform, number> = { facebook: facebook.length, tiktok: tiktok.length, youtube: youtube.length };

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
      <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-40 -left-40 size-[36rem] rounded-full bg-facebook/25 blur-[120px]" />
          <div className="absolute -right-40 -bottom-56 size-[32rem] rounded-full bg-brand/20 blur-[120px]" />
        </div>
        <div className={`${container} relative grid items-center gap-10 py-10 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-20`}>
          <div>
            <p className="eyebrow flex items-center gap-2 text-white/80">
              <span className="live-dot" aria-hidden />
              {siteConfig.brandName} · {siteConfig.hero.eyebrow}
            </p>
            <h1 id="hero-title" className="mt-4 font-display text-[2.75rem] leading-[0.95] font-bold tracking-tight min-[400px]:text-5xl sm:text-6xl lg:text-7xl">
              {siteConfig.hero.headline.split(". ").map((part, i, arr) => (
                <span key={i} className={i === arr.length - 1 ? "block text-brand" : "block"}>
                  {part}
                  {i < arr.length - 1 ? "." : ""}
                </span>
              ))}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80 sm:text-xl">{siteConfig.hero.text}</p>
            <div className="mt-8 flex flex-col gap-3 min-[460px]:flex-row min-[460px]:flex-wrap">
              <a href="#latest" className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-6 text-base font-bold text-black transition hover:bg-white/90">
                <PlayIcon className="size-5" /> Watch Latest Videos
              </a>
              <FollowButton platform="facebook" size="lg" />
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-muted">
              <span>Also on</span>
              <a href={profileUrl("tiktok")} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-white hover:underline">
                <PlatformIcon platform="tiktok" className="size-4" /> TikTok
              </a>
              <a href={profileUrl("youtube")} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-white hover:underline">
                <PlatformIcon platform="youtube" className="size-4" /> YouTube
              </a>
            </div>
          </div>

          <HeroFeature video={hero} />
        </div>
      </section>

      {/* ─── Platform strip (the reference's "ON NOW" schedule row) ─── */}
      <nav id="latest" aria-label="Browse videos by platform" className={`${container} pt-8 sm:pt-10`}>
        <ul className="rail md:grid md:grid-cols-3 md:overflow-visible">
          {PLATFORM_ORDER.map((p, i) => (
            <li key={p} className="w-[72vw] max-w-xs md:w-auto md:max-w-none">
              <a
                href={`#${p}-videos`}
                className={`relative flex h-full min-h-28 flex-col justify-between overflow-hidden rounded-lg p-4 ring-1 ring-white/10 transition hover:ring-white/40 ${i === 0 ? "bg-gradient-to-b from-[#123a8a] to-[#0a1a3f]" : "bg-surface-3"}`}
              >
                {i === 0 && <span className="absolute top-0 right-10 h-full w-0.5 bg-brand" aria-hidden />}
                <span className={`eyebrow flex items-center gap-2 ${i === 0 ? "text-white" : "text-muted"}`}>
                  {i === 0 ? <span className="live-dot" aria-hidden /> : <PlatformIcon platform={p} className="size-3.5" />}
                  {i === 0 ? "Top pick · Facebook" : platformMeta[p].name}
                </span>
                <span className="mt-2 block font-display text-xl font-bold">
                  Latest {platformMeta[p].videoNoun}
                </span>
                <span className="mt-1 text-sm text-white/70">
                  {counts[p] ? `${counts[p]} video${counts[p] === 1 ? "" : "s"}` : "Coming soon"}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ─── 1. Facebook (highest priority) ─── */}
      <section aria-labelledby="facebook-videos-title" id="facebook-videos" className={`${container} pt-12 sm:pt-16`}>
        <div className="rounded-3xl bg-gradient-to-b from-facebook/15 to-transparent p-4 ring-1 ring-facebook/30 sm:p-8">
          <SectionHeading
            id="facebook-videos-title"
            platform="facebook"
            eyebrow={<><span className="live-dot" aria-hidden /> Main channel</>}
            title="Latest Facebook Reels"
            action={<ViewAllLink href="/facebook">View all Facebook videos</ViewAllLink>}
          />
          {facebookRest.length ? (
            <VideoRail videos={facebookRest} cols="md:grid-cols-3 lg:grid-cols-4" />
          ) : (
            <EmptyState platform="facebook" compact />
          )}
        </div>
      </section>

      {/* ─── 2. TikTok ─── */}
      <section aria-labelledby="tiktok-videos-title" id="tiktok-videos" className={`${container} pt-14 sm:pt-20`}>
        <SectionHeading
          id="tiktok-videos-title"
          platform="tiktok"
          title="Latest TikTok Videos"
          action={<ViewAllLink href="/tiktok">View all TikTok videos</ViewAllLink>}
        />
        {tiktokLatest.length ? <VideoRail videos={tiktokLatest} cols="md:grid-cols-4 lg:grid-cols-6" /> : <EmptyState platform="tiktok" compact />}
      </section>

      {/* ─── 3. YouTube ─── */}
      <section aria-labelledby="youtube-videos-title" id="youtube-videos" className={`${container} pt-14 sm:pt-20`}>
        <SectionHeading
          id="youtube-videos-title"
          platform="youtube"
          title="Latest on YouTube"
          action={<ViewAllLink href="/youtube">View all YouTube videos</ViewAllLink>}
        />
        {ytShorts.length === 0 && ytVideos.length === 0 && <EmptyState platform="youtube" compact />}
        {ytShorts.length > 0 && (
          <>
            <h3 className="eyebrow mb-3 text-muted">Shorts</h3>
            <VideoRail videos={ytShorts} cols="md:grid-cols-4 lg:grid-cols-6" />
          </>
        )}
        {ytVideos.length > 0 && (
          <>
            <h3 className={`eyebrow mb-4 text-muted ${ytShorts.length ? "mt-10" : ""}`}>Latest videos</h3>
            <ul className="grid gap-6 lg:grid-cols-2 lg:gap-x-10">
              {ytVideos.map((v) => (
                <li key={v.key}>
                  <VideoRow video={v} />
                </li>
              ))}
            </ul>
            <ShowMoreLink href="/youtube">Show more</ShowMoreLink>
          </>
        )}
      </section>

      {/* ─── About ─── */}
      <section aria-labelledby="about-title" className={`${container} pt-20 sm:pt-28`}>
        <div className="grid items-center gap-8 rounded-3xl bg-surface p-6 ring-1 ring-white/10 sm:p-10 md:grid-cols-[minmax(0,18rem)_1fr] md:gap-12">
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-brand/30 via-ink to-facebook/30 p-6 ring-1 ring-white/10">
            <Image src={logo} alt="" className="h-auto w-full" sizes="(min-width: 768px) 240px, 80vw" />
          </div>
          <div>
            <p className="eyebrow text-brand-text">About the creator</p>
            <h2 id="about-title" className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {siteConfig.about.heading}
            </h2>
            {siteConfig.about.paragraphs.map((p, i) => (
              <p key={i} className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
                {p}
              </p>
            ))}
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <SocialIcons />
              <Link href="/contact" className="inline-flex h-11 items-center rounded-full px-5 text-sm font-bold ring-1 ring-white/30 hover:bg-white hover:text-black">
                Work with me
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Follow ─── */}
      <section aria-labelledby="follow-title" className={`${container} pt-20 sm:pt-28`}>
        <SectionHeading id="follow-title" eyebrow="Never miss a video" title="Follow Sabbir LIVE" />
        <ul className="grid gap-4 lg:grid-cols-4">
          {PLATFORM_ORDER.map((p) => (
            <li key={p} className={p === "facebook" ? "lg:col-span-2" : ""}>
              <FollowCard platform={p} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function VideoRail({ videos, cols }: { videos: Video[]; cols: string }) {
  return (
    <ul className={`rail -mx-4 px-4 md:mx-0 md:grid md:gap-5 md:overflow-visible md:px-0 ${cols}`}>
      {videos.map((v) => (
        <li key={v.key} className={railItem}>
          <VideoCard video={v} sizes="(min-width: 1024px) 240px, (min-width: 768px) 30vw, 62vw" />
        </li>
      ))}
    </ul>
  );
}

function HeroFeature({ video }: { video: Video | null }) {
  if (!video) {
    return (
      <div className="mx-auto w-full max-w-[22rem]">
        <div className="relative flex aspect-[9/16] flex-col items-center justify-center gap-6 overflow-hidden rounded-[1.25rem] bg-gradient-to-b from-facebook/60 via-facebook-deep to-ink p-8 text-center ring-1 ring-white/15">
          <Image src={logo} alt="" className="h-auto w-4/5" sizes="280px" priority />
          <p className="font-display text-xl font-semibold">New Reels drop on Facebook first</p>
          <FollowButton platform="facebook" />
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-[22rem]">
      <p className="eyebrow mb-3 flex items-center gap-2">
        <span className="live-dot" aria-hidden /> {video.featured ? "Featured on Facebook" : "Latest on Facebook"}
      </p>
      <div className="group relative aspect-[9/16] overflow-hidden rounded-[1.25rem] bg-surface-2 ring-1 ring-white/15">
        <Thumb src={video.thumbnail} alt={video.title ? `Thumbnail: ${video.title}` : "Latest Facebook Reel thumbnail"} platform="facebook" sizes="352px" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" aria-hidden />
        <HeroPlayButton video={video} />
      </div>
      {video.title && <h2 className="mt-4 font-display text-xl leading-snug font-bold">{video.title}</h2>}
      {video.caption && <p className="mt-2 line-clamp-2 text-sm text-muted">{video.caption}</p>}
    </div>
  );
}

const followCardStyle: Record<Platform, string> = {
  facebook: "bg-gradient-to-br from-facebook to-[#0a3aa8]",
  tiktok: "bg-gradient-to-br from-[#2a2a2e] to-[#111] ring-1 ring-white/10",
  youtube: "bg-gradient-to-br from-[#3a0a10] to-[#160406] ring-1 ring-white/10",
};

function FollowCard({ platform }: { platform: Platform }) {
  const meta = platformMeta[platform];
  const social = siteConfig.social[platform];
  const handle = "handle" in social ? `@${social.handle}` : siteConfig.brandName;
  return (
    <a
      href={profileUrl(platform)}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex h-full min-h-44 flex-col justify-between gap-6 rounded-2xl p-6 transition hover:-translate-y-0.5 ${followCardStyle[platform]}`}
    >
      <div className="flex items-center justify-between">
        <PlatformIcon platform={platform} className={platform === "facebook" ? "size-10" : "size-8"} />
        <span className="eyebrow text-white/80">{platform === "facebook" ? "Main channel" : meta.videoNoun}</span>
      </div>
      <div>
        <p className={`font-display font-bold ${platform === "facebook" ? "text-3xl" : "text-2xl"}`}>{meta.name}</p>
        <p className="mt-1 text-sm text-white/80">{handle}</p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-black">
          {meta.follow}
        </span>
      </div>
    </a>
  );
}
