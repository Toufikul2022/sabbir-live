import { NextResponse } from "next/server";
import { BLOG_DIR, isValidSlug, slugify, type BlogPost } from "@/lib/blog-shared";
import { isAuthorised } from "@/lib/manage/auth";
import { deleteFile, listFolder, readFile, writeFile } from "@/lib/manage/github";

export const runtime = "nodejs";

const fail = (status: number, message: string) => NextResponse.json({ message }, { status });
const fileFor = (slug: string) => `${BLOG_DIR}/${slug}.json`;

async function run(fn: () => Promise<NextResponse>) {
  if (!(await isAuthorised())) return fail(401, "Please log in again.");
  try {
    return await fn();
  } catch (err) {
    return fail(502, err instanceof Error ? err.message : "Something went wrong.");
  }
}

/** ?slug=… returns one post; otherwise the list of all posts (drafts included). */
export function GET(req: Request) {
  return run(async () => {
    const slug = new URL(req.url).searchParams.get("slug");
    if (slug) {
      const file = isValidSlug(slug) ? await readFile(fileFor(slug)) : null;
      return file ? NextResponse.json({ post: JSON.parse(file.text) as BlogPost }) : fail(404, "Post not found.");
    }
    const files = (await listFolder(BLOG_DIR)).filter((f) => f.name.endsWith(".json"));
    const posts = await Promise.all(
      files.map(async (f) => {
        const p = JSON.parse((await readFile(f.path))!.text) as BlogPost;
        return { slug: p.slug, title: p.title, date: p.date, draft: p.draft };
      }),
    );
    return NextResponse.json({ posts: posts.sort((a, b) => b.date.localeCompare(a.date)) });
  });
}

/** Create (no slug) or update (with slug) a post. */
export function POST(req: Request) {
  return run(async () => {
    const b = (await req.json().catch(() => ({}))) as Partial<BlogPost>;
    const title = (b.title ?? "").trim();
    const body = (b.body ?? "").trim();
    if (!title) return fail(400, "Please add a title.");
    if (!body) return fail(400, "Please write something in the post.");
    if (title.length > 200) return fail(400, "The title is too long (200 characters max).");
    if (b.cover && !/^\/uploads\/blog\/[\w./-]+$/.test(b.cover)) return fail(400, "Invalid cover image.");

    const editing = b.slug && isValidSlug(b.slug) ? b.slug : null;
    let slug = editing ?? slugify(title);
    const existing = await readFile(fileFor(slug));
    if (!editing && existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`; // title already used

    const post: BlogPost = {
      slug,
      title,
      summary: (b.summary ?? "").trim().slice(0, 300),
      body,
      cover: b.cover ?? "",
      date: /^\d{4}-\d{2}-\d{2}$/.test(b.date ?? "") ? b.date! : new Date().toISOString().slice(0, 10),
      draft: Boolean(b.draft),
    };
    await writeFile(
      fileFor(slug),
      `${JSON.stringify(post, null, 2)}\n`,
      `${editing ? "Update" : "Add"} blog post: ${title}`,
      editing ? existing?.sha : undefined,
    );
    return NextResponse.json({ post });
  });
}

export function DELETE(req: Request) {
  return run(async () => {
    const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
    const file = slug && isValidSlug(slug) ? await readFile(fileFor(slug)) : null;
    if (!file) return fail(404, "Post not found.");
    await deleteFile(fileFor(slug!), file.sha, `Delete blog post ${slug}`);
    return NextResponse.json({ ok: true });
  });
}
