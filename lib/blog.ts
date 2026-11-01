import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { BLOG_DIR, type BlogPost } from "./blog-shared";

export { renderMarkdown } from "./markdown";

/** Published posts, newest first. Read from the repository at build time. */
export function getPosts(): BlogPost[] {
  // Only read while building (blog pages are fully static), so skip output tracing.
  const dir = join(/* turbopackIgnore: true */ process.cwd(), BLOG_DIR);
  let files: string[] = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  return files
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as BlogPost)
    .filter((p) => !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string) {
  return getPosts().find((p) => p.slug === slug) ?? null;
}
