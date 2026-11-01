import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { container } from "@/components/ui";
import { getPost, getPosts, renderMarkdown } from "@/lib/blog";
import { formatPostDate, readingMinutes } from "@/lib/blog-shared";
import { siteConfig, siteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost(decodeURIComponent((await params).slug));
  if (!post) return {};
  const path = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.summary || undefined,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      siteName: siteConfig.brandName,
      title: post.title,
      description: post.summary || undefined,
      url: path,
      publishedTime: post.date,
      ...(post.cover ? { images: [post.cover] } : {}),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = getPost(decodeURIComponent((await params).slug));
  if (!post) notFound();
  const others = getPosts().filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className={`${container} pt-6 sm:pt-8`}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.summary || undefined,
          datePublished: post.date,
          author: { "@type": "Person", name: siteConfig.creatorName, url: siteUrl },
          ...(post.cover ? { image: `${siteUrl}${post.cover}` } : {}),
          mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
        }}
      />
      <div className="eyebrow flex items-center justify-between gap-4 border-y border-line py-3 text-muted">
        <Link href="/blog" className="group flex items-center gap-2 text-white">
          <ArrowRightIcon className="size-3.5 rotate-180 text-brand transition group-hover:-translate-x-0.5" /> All posts
        </Link>
        <span>
          {formatPostDate(post.date)} · {readingMinutes(post.body)} min read
        </span>
      </div>

      <header className="mx-auto max-w-3xl pt-10 sm:pt-14">
        <h1 className="display text-[clamp(2.4rem,7vw,4.5rem)] leading-[1.1]">{post.title}</h1>
        {post.summary && <p className="mt-5 text-xl leading-relaxed text-white/75">{post.summary}</p>}
        <p className="eyebrow mt-6 text-muted">By {siteConfig.creatorName}</p>
      </header>

      {post.cover && (
        <div className="relative mx-auto mt-10 aspect-[16/9] max-w-5xl overflow-hidden rounded-[var(--radius-card)] bg-surface-2">
          <Image src={post.cover} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
        </div>
      )}

      <div className="prose mx-auto mt-10 max-w-3xl sm:mt-14" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />

      {others.length > 0 && (
        <nav aria-label="More posts" className="mx-auto mt-20 max-w-3xl border-t border-line pt-8">
          <p className="eyebrow text-muted">Keep reading</p>
          <ul className="mt-4 divide-y divide-line">
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="group flex items-center justify-between gap-6 py-4">
                  <span className="font-display text-2xl leading-tight font-semibold">
                    <span className="link-sweep">{p.title}</span>
                  </span>
                  <ArrowRightIcon className="size-5 shrink-0 text-brand transition group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  );
}
