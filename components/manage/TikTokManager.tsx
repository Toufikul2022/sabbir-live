"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type { ManagedTikTok } from "@/lib/manage/types";
import { CheckIcon, ExternalIcon, TikTokIcon } from "../Icons";

type Message = { kind: "ok" | "error"; text: string } | null;

export function TikTokManager() {
  const router = useRouter();
  const [videos, setVideos] = useState<ManagedTikTok[] | null>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState<string | null>(null); // which action is running
  const [message, setMessage] = useState<Message>(null);
  const [loadError, setLoadError] = useState("");

  async function call(method: string, body?: object) {
    const res = await fetch("/api/manage/tiktok", {
      method,
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    const out = ((await res?.json().catch(() => null)) ?? {}) as { videos?: ManagedTikTok[]; message?: string; added?: string };
    if (res?.status === 401) router.refresh(); // session expired → back to login
    if (!res?.ok) throw new Error(out.message ?? "Network error — please try again.");
    if (out.videos) setVideos(out.videos);
    return out;
  }

  // Load the current list once on open.
  useEffect(() => {
    call("GET").catch((e: Error) => setLoadError(e.message));
  }, []);

  async function paste() {
    try {
      setUrl((await navigator.clipboard.readText()).trim());
    } catch {
      setMessage({ kind: "error", text: "Your browser blocked pasting. Press and hold in the box and choose Paste." });
    }
  }

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy("add");
    setMessage(null);
    try {
      const out = await call("POST", { url, title, featured });
      setMessage({ kind: "ok", text: `Added “${out.added}”. It will appear on the website in about a minute.` });
      setUrl("");
      setTitle("");
      setFeatured(false);
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function act(id: string, method: "PATCH" | "DELETE", extra: object = {}) {
    if (method === "DELETE" && !confirm("Remove this video from the website? (It stays on TikTok.)")) return;
    setBusy(id);
    setMessage(null);
    try {
      await call(method, { id, ...extra });
      setMessage({ kind: "ok", text: "Saved. The website updates in about a minute." });
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await fetch("/api/manage/session", { method: "DELETE" });
    router.refresh();
  }

  const input = "block w-full rounded-sm bg-surface-2 px-4 text-lg ring-1 ring-white/15 focus:ring-2 focus:ring-tiktok-cyan focus:outline-none";

  return (
    <div className="mt-8 space-y-10">
      <ol className="space-y-1.5 text-white/75">
        <li>1. In the TikTok app, open the video and tap <strong className="text-white">Share → Copy link</strong>.</li>
        <li>2. Come back here, tap <strong className="text-white">Paste</strong>, then <strong className="text-white">Add video</strong>.</li>
      </ol>

      <form onSubmit={add} className="space-y-5 border border-line bg-surface p-5 sm:p-8">
        <div>
          <label htmlFor="tt-url" className="eyebrow block text-white/85">
            TikTok link
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="tt-url"
              type="url"
              inputMode="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@sabbirlive.official/video/…"
              className={`${input} h-14 min-w-0 flex-1 placeholder:text-white/30`}
            />
            <button type="button" onClick={paste} className="h-14 shrink-0 rounded-sm bg-surface-3 px-4 font-semibold hover:bg-white hover:text-black">
              Paste
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="tt-title" className="eyebrow block text-white/85">
            Title <span className="text-muted normal-case">(optional — filled in from TikTok if empty)</span>
          </label>
          <input id="tt-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} className={`${input} mt-2 h-12`} />
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="size-5 accent-[var(--color-tiktok)]" />
          Show this video first
        </label>

        <div aria-live="polite">
          {message && (
            <p className={`flex items-start gap-2 p-3 ring-1 ${message.kind === "ok" ? "bg-emerald-500/10 ring-emerald-400/40" : "bg-brand/10 ring-brand-text/50"}`}>
              {message.kind === "ok" && <CheckIcon className="mt-1 size-4 shrink-0 text-emerald-300" />}
              {message.text}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={busy === "add"}
          className="btn-sweep inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-tiktok text-lg font-semibold text-white transition-colors [--sweep:#ffffff] hover:text-black disabled:opacity-60"
        >
          <TikTokIcon className="size-5" />
          {busy === "add" ? "Adding…" : "Add video"}
        </button>
      </form>

      <section aria-labelledby="tt-list">
        <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
          <h2 id="tt-list" className="display text-3xl">
            On the website {videos && <span className="text-muted">({videos.length})</span>}
          </h2>
          <button type="button" onClick={logout} className="eyebrow link-sweep text-muted hover:text-white">
            Log out
          </button>
        </div>
        {loadError ? (
          <p className="py-6 text-brand-text">Couldn’t load the list: {loadError}</p>
        ) : videos === null ? (
          <p className="py-6 text-muted">Loading…</p>
        ) : videos.length === 0 ? (
          <p className="py-6 text-muted">No TikTok videos yet. Add the first one above.</p>
        ) : (
          <ul>
            {videos.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-4">
                <div className="min-w-0 flex-1">
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="link-sweep font-semibold">
                    {v.title || "Untitled TikTok"} <ExternalIcon className="inline size-3.5 align-baseline" />
                  </a>
                  <p className="eyebrow mt-1 text-muted">
                    {v.publishedAt ?? "No date"}
                    {v.featured && <span className="text-tiktok"> · Shown first</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy === v.id}
                    onClick={() => act(v.id, "PATCH", { featured: !v.featured })}
                    className="h-10 rounded-full px-4 text-sm font-semibold ring-1 ring-white/30 hover:bg-white hover:text-black disabled:opacity-50"
                  >
                    {v.featured ? "Unpin" : "Show first"}
                  </button>
                  <button
                    type="button"
                    disabled={busy === v.id}
                    onClick={() => act(v.id, "DELETE")}
                    className="h-10 rounded-full px-4 text-sm font-semibold text-brand-text ring-1 ring-brand-text/50 hover:bg-brand hover:text-white disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
