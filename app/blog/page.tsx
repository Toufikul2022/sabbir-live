import Image from "next/image";
import Link from "next/link";
import { container, SectionHeading } from "@/components/ui";
import { getPosts } from "@/lib/blog";
import { formatPostDate, readingMinutes } from "@/lib/blog-shared";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export const metadata = pageMetadata({
  title: "Blog",
  description: `Stories, notes and behind-the-scenes from ${siteConfig.creatorName}.`,
  path: "/blog",
});

export default function BlogPage() {
  const posts = getPosts();
  const [lead, ...rest] = posts;
  return (
    <div className={`${container} pt-6 sm:pt-8`}>
      <div className="eyebrow flex items-center justify-between gap-4 border-y border-line py-3 text-muted">
        <span className="flex items-center gap-2 text-white">
          <span className="live-dot" aria-hidden /> Blog
        </span>
        <span>
          {posts.length} post{posts.length === 1 ? "" : "s"}
        </span>
      </div>
      <h1 className="display mt-8 text-hero sm:mt-10">
        <span className="block overflow-hidden pb-[0.05em]">
          <span className="rise">Stories &amp;</span>
        </span>
        <span className="block overflow-hidden pb-[0.06em]">
          <span className="rise text-brand [--rise-delay:120ms]">notes</span>
        </span>
      </h1>

      {!lead ? (
        <p className="mt-10 border border-line bg-surface p-8 text-lg text-white/75">The first post is on its way. Check back soon.</p>
      ) : (
        <>
          <Link href={`/blog/${lead.slug}`} className="group mt-10 grid gap-6 border-t border-line pt-8 md:grid-cols-[1.3fr_1fr] md:items-center md:gap-10" data-reveal>
            <Cover post={lead} sizes="(min-width: 768px) 700px, 100vw" priority />
            <div>
              <p className="eyebrow text-muted">
                Latest · {formatPostDate(lead.date)} · {readingMinutes(lead.body)} min read
              </p>
              <h2 className="display mt-3 text-title leading-[1.1]">
                <span className="link-sweep">{lead.title}</span>
              </h2>
              {lead.summary && <p className="mt-4 text-lg leading-relaxed text-white/75">{lead.summary}</p>}
            </div>
          </Link>

          {rest.length > 0 && (
            <section aria-labelledby="more-posts" className="pt-16">
              <SectionHeading id="more-posts" label="All posts" title="More stories" />
              <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" data-reveal>
                {rest.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="group block">
                      <Cover post={p} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />
                      <p className="eyebrow mt-4 text-muted">
                        {formatPostDate(p.date)} · {readingMinutes(p.body)} min read
                      </p>
                      <h3 className="mt-1.5 font-display text-2xl leading-tight font-semibold">
                        <span className="link-sweep">{p.title}</span>
                      </h3>
                      {p.summary && <p className="mt-2 line-clamp-2 text-white/70">{p.summary}</p>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Cover({ post, sizes, priority = false }: { post: { cover: string; title: string }; sizes: string; priority?: boolean }) {
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] bg-surface-2 ring-1 ring-white/10 transition duration-500 group-hover:ring-2 group-hover:ring-brand">
      {post.cover ? (
        <Image src={post.cover} alt="" fill sizes={sizes} priority={priority} className="object-cover transition duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" />
      ) : (
        <div className="absolute inset-0 flex items-end bg-gradient-to-br from-brand/40 via-surface-2 to-ink p-5">
          <span className="display line-clamp-3 text-3xl leading-[1.1] text-white/90">{post.title}</span>
        </div>
      )}
    </div>
  );
}
