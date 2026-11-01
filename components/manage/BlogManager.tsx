"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { slugify, type BlogPost } from "@/lib/blog-shared";
import { renderMarkdown } from "@/lib/markdown";
import { CheckIcon, ExternalIcon } from "../Icons";

type Summary = Pick<BlogPost, "slug" | "title" | "date" | "draft">;
type Message = { kind: "ok" | "error"; text: string } | null;

const today = () => new Date().toISOString().slice(0, 10);
const blank = (): Omit<BlogPost, "slug"> & { slug?: string } => ({ title: "", summary: "", body: "", cover: "", date: today(), draft: false });

async function api<T>(path: string, method = "GET", body?: object): Promise<T> {
  const res = await fetch(path, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined }).catch(() => null);
  const out = (await res?.json().catch(() => null)) ?? {};
  if (res?.status === 401) location.reload(); // session expired → login
  if (!res?.ok) throw new Error((out as { message?: string }).message ?? "Network error — please try again.");
  return out as T;
}

/** Shrinks a photo in the browser (max 1600px wide, JPEG) before uploading. */
async function uploadPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((ok) => canvas.toBlob((b) => ok(b!), "image/jpeg", 0.82));
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const { path } = await api<{ path: string }>("/api/manage/upload", "POST", { data: btoa(binary), name: file.name });
  return path;
}

export function BlogManager() {
  const [posts, setPosts] = useState<Summary[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<ReturnType<typeof blank> | null>(null);
  const [message, setMessage] = useState<Message>(null);

  const load = () =>
    api<{ posts: Summary[] }>("/api/manage/blog")
      .then((r) => setPosts(r.posts))
      .catch((e: Error) => setLoadError(e.message));

  // Load the list once on open.
  useEffect(() => {
    load();
  }, []);

  async function open(slug: string) {
    setMessage(null);
    try {
      setEditing((await api<{ post: BlogPost }>(`/api/manage/blog?slug=${encodeURIComponent(slug)}`)).post);
    } catch (e) {
      setMessage({ kind: "error", text: (e as Error).message });
    }
  }

  async function remove(p: Summary) {
    if (!confirm(`Delete “${p.title}”? This can’t be undone.`)) return;
    try {
      await api("/api/manage/blog", "DELETE", { slug: p.slug });
      setPosts((list) => list?.filter((x) => x.slug !== p.slug) ?? null);
      setMessage({ kind: "ok", text: "Deleted. The website updates in about a minute." });
    } catch (e) {
      setMessage({ kind: "error", text: (e as Error).message });
    }
  }

  if (editing) {
    return (
      <Editor
        initial={editing}
        onDone={(saved) => {
          setEditing(null);
          if (saved) {
            setMessage({
              kind: "ok",
              text: saved.draft ? `Saved “${saved.title}” as a draft.` : `Published “${saved.title}”. It will be live in about a minute.`,
            });
            load();
          }
        }}
      />
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-title">
          Blog <span className="text-brand">posts</span>
        </h1>
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setEditing(blank());
          }}
          className="btn-sweep h-12 rounded-full bg-brand-strong px-6 font-semibold text-white transition-colors [--sweep:#ffffff] hover:text-black"
        >
          + New post
        </button>
      </div>
      <Notice message={message} />
      {loadError ? (
        <p className="mt-6 text-brand-text">Couldn’t load posts: {loadError}</p>
      ) : posts === null ? (
        <p className="mt-6 text-muted">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="mt-6 border border-line bg-surface p-6 text-white/75">No posts yet. Tap “New post” to write the first one.</p>
      ) : (
        <ul className="mt-6 border-t border-line">
          {posts.map((p) => (
            <li key={p.slug} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p.title}</p>
                <p className="eyebrow mt-1 text-muted">
                  {p.date}
                  {p.draft ? <span className="text-brand-text"> · Draft</span> : " · Published"}
                </p>
              </div>
              <div className="flex gap-2">
                {!p.draft && (
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold ring-1 ring-white/30 hover:bg-white hover:text-black">
                    View <ExternalIcon className="size-3.5" />
                  </a>
                )}
                <button type="button" onClick={() => open(p.slug)} className="h-10 rounded-full px-4 text-sm font-semibold ring-1 ring-white/30 hover:bg-white hover:text-black">
                  Edit
                </button>
                <button type="button" onClick={() => remove(p)} className="h-10 rounded-full px-4 text-sm font-semibold text-brand-text ring-1 ring-brand-text/50 hover:bg-brand hover:text-white">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Notice({ message }: { message: Message }) {
  return (
    <div aria-live="polite">
      {message && (
        <p className={`mt-5 flex items-start gap-2 p-3 ring-1 ${message.kind === "ok" ? "bg-emerald-500/10 ring-emerald-400/40" : "bg-brand/10 ring-brand-text/50"}`}>
          {message.kind === "ok" && <CheckIcon className="mt-1 size-4 shrink-0 text-emerald-300" />}
          {message.text}
        </p>
      )}
    </div>
  );
}

const TOOLS: { label: string; title: string; wrap: [string, string] | null; line?: string }[] = [
  { label: "H", title: "Heading", wrap: null, line: "## " },
  { label: "B", title: "Bold", wrap: ["**", "**"] },
  { label: "I", title: "Italic", wrap: ["_", "_"] },
  { label: "•", title: "Bullet list", wrap: null, line: "- " },
  { label: "❝", title: "Quote", wrap: null, line: "> " },
];

function Editor({ initial, onDone }: { initial: ReturnType<typeof blank>; onDone: (saved: BlogPost | null) => void }) {
  const [post, setPost] = useState(initial);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  // Uploaded photos aren't on the live site until it redeploys, so preview uses local copies.
  const [localPhotos, setLocalPhotos] = useState<Record<string, string>>({});
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const set = <K extends keyof typeof post>(k: K, v: (typeof post)[K]) => setPost((p) => ({ ...p, [k]: v }));

  function edit(before: string, after: string, linePrefix?: string) {
    const el = bodyRef.current!;
    const { selectionStart: s, selectionEnd: e, value } = el;
    let next: string;
    let cursor: number;
    if (linePrefix) {
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      next = value.slice(0, lineStart) + linePrefix + value.slice(lineStart);
      cursor = e + linePrefix.length;
    } else {
      const text = value.slice(s, e) || "text";
      next = value.slice(0, s) + before + text + after + value.slice(e);
      cursor = s + before.length + text.length + after.length;
    }
    set("body", next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  function addLink() {
    const url = prompt("Paste the link (https://…)");
    if (url && /^https?:\/\//.test(url)) edit("[", `](${url})`);
  }

  async function addPhoto(file: File | undefined, target: "cover" | "body") {
    if (!file) return;
    setBusy(target);
    setMessage(null);
    try {
      const path = await uploadPhoto(file);
      setLocalPhotos((m) => ({ ...m, [path]: URL.createObjectURL(file) }));
      if (target === "cover") set("cover", path);
      else edit("", `\n![${file.name.replace(/\.[^.]+$/, "")}](${path})\n`);
    } catch (e) {
      setMessage({ kind: "error", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function save(e: FormEvent | null, draft: boolean) {
    e?.preventDefault();
    setBusy(draft ? "draft" : "publish");
    setMessage(null);
    try {
      const { post: saved } = await api<{ post: BlogPost }>("/api/manage/blog", "POST", { ...post, draft });
      onDone(saved);
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
      setBusy(null);
    }
  }

  const photo = (path: string) => localPhotos[path] ?? path;
  const preview = Object.entries(localPhotos).reduce((html, [path, local]) => html.split(`src="${path}"`).join(`src="${local}"`), renderMarkdown(post.body));
  const input = "block w-full rounded-sm bg-surface-2 px-4 ring-1 ring-white/15 focus:ring-2 focus:ring-tiktok-cyan focus:outline-none";
  const label = "eyebrow block text-white/85";

  return (
    <form onSubmit={(e) => save(e, false)} className="mt-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="display text-title">{initial.slug ? "Edit post" : "New post"}</h1>
        <button type="button" onClick={() => onDone(null)} className="eyebrow link-sweep text-muted hover:text-white">
          ← Back to posts
        </button>
      </div>

      <div>
        <label htmlFor="b-title" className={label}>Title</label>
        <input id="b-title" required maxLength={200} value={post.title} onChange={(e) => set("title", e.target.value)} className={`${input} mt-2 h-14 text-xl`} />
        {!initial.slug && post.title && <p className="mt-1.5 text-xs text-muted">Address: /blog/{slugify(post.title)}</p>}
      </div>

      <div>
        <label htmlFor="b-summary" className={label}>
          Short summary <span className="text-muted normal-case">(shown on the blog page and when shared)</span>
        </label>
        <textarea id="b-summary" rows={2} maxLength={300} value={post.summary} onChange={(e) => set("summary", e.target.value)} className={`${input} mt-2 py-3`} />
      </div>

      <div>
        <span className={label}>Cover photo</span>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {/* Plain <img>: a just-uploaded photo isn't deployed yet, so this shows the local copy. */}
          {post.cover && (
            <img src={photo(post.cover)} alt="" className="h-24 w-40 rounded-sm object-cover ring-1 ring-white/15" />
          )}
          <label className="inline-flex h-11 cursor-pointer items-center rounded-full px-5 text-sm font-semibold ring-1 ring-white/30 hover:bg-white hover:text-black">
            {busy === "cover" ? "Uploading…" : post.cover ? "Change photo" : "Choose photo"}
            <input type="file" accept="image/*" className="sr-only" disabled={busy === "cover"} onChange={(e) => addPhoto(e.target.files?.[0], "cover")} />
          </label>
          {post.cover && (
            <button type="button" onClick={() => set("cover", "")} className="text-sm text-muted underline">
              Remove
            </button>
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line">
          <div className="flex">
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className="-mb-px border-b-2 border-transparent px-4 py-2.5 font-display text-lg font-semibold tracking-wide text-white/60 uppercase aria-pressed:border-brand aria-pressed:text-white"
              >
                {t === "write" ? "Write" : "Preview"}
              </button>
            ))}
          </div>
          {tab === "write" && (
            <div className="flex flex-wrap gap-1 pb-1.5" role="toolbar" aria-label="Formatting">
              {TOOLS.map((t) => (
                <button key={t.title} type="button" title={t.title} aria-label={t.title} onClick={() => edit(t.wrap?.[0] ?? "", t.wrap?.[1] ?? "", t.line)} className="size-10 rounded-sm bg-surface-2 font-bold hover:bg-white hover:text-black">
                  {t.label}
                </button>
              ))}
              <button type="button" title="Link" onClick={addLink} className="h-10 rounded-sm bg-surface-2 px-3 text-sm font-semibold hover:bg-white hover:text-black">
                Link
              </button>
              <label className="inline-flex h-10 cursor-pointer items-center rounded-sm bg-surface-2 px-3 text-sm font-semibold hover:bg-white hover:text-black">
                {busy === "body" ? "Uploading…" : "Photo"}
                <input type="file" accept="image/*" className="sr-only" disabled={busy === "body"} onChange={(e) => addPhoto(e.target.files?.[0], "body")} />
              </label>
            </div>
          )}
        </div>
        {tab === "write" ? (
          <textarea
            ref={bodyRef}
            aria-label="Post text"
            rows={16}
            value={post.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder="Start writing… Use the buttons above for headings, bold text, lists, links and photos."
            className={`${input} mt-3 py-3 text-lg leading-relaxed`}
          />
        ) : (
          <div className="prose mt-6 min-h-40" dangerouslySetInnerHTML={{ __html: preview || "<p>Nothing to preview yet.</p>" }} />
        )}
      </div>

      <div>
        <label htmlFor="b-date" className={label}>Date</label>
        <input id="b-date" type="date" value={post.date} onChange={(e) => set("date", e.target.value)} className={`${input} mt-2 h-12 w-auto [color-scheme:dark]`} />
      </div>

      <Notice message={message} />

      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
        <button type="submit" disabled={busy !== null} className="btn-sweep h-14 rounded-full sm:flex-1 bg-brand-strong text-lg font-semibold text-white transition-colors [--sweep:#ffffff] hover:text-black disabled:opacity-60">
          {busy === "publish" ? "Publishing…" : "Publish"}
        </button>
        <button type="button" disabled={busy !== null} onClick={() => save(null, true)} className="h-14 rounded-full px-8 text-lg font-semibold ring-1 ring-white/30 hover:bg-white hover:text-black disabled:opacity-60">
          {busy === "draft" ? "Saving…" : "Save as draft"}
        </button>
      </div>
    </form>
  );
}
