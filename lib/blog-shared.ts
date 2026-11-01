// Blog types and helpers shared by the website, the /manage editor and the API.

/** One post, stored as content/blog/<slug>.json */
export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  /** Markdown */
  body: string;
  /** e.g. /uploads/blog/2026-11/cover.jpg */
  cover: string;
  /** YYYY-MM-DD */
  date: string;
  draft: boolean;
};

export const BLOG_DIR = "content/blog";

/**
 * URL-safe slug that keeps Bengali (and any other script): letters, combining
 * marks and digits stay, everything else becomes a hyphen.
 */
export function slugify(title: string) {
  const slug = title
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
  return slug || `post-${Date.now().toString(36)}`;
}

export function isValidSlug(slug: string) {
  return /^[\p{L}\p{M}\p{N}]+(?:-[\p{L}\p{M}\p{N}]+)*$/u.test(slug) && slug.length <= 100;
}

/** Rough reading time, counting words in any script. */
export function readingMinutes(markdown: string) {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatPostDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}
