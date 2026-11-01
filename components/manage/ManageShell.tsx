import Link from "next/link";
import type { ReactNode } from "react";
import { isAuthorised, missingSetup } from "@/lib/manage/auth";
import { container } from "../ui";
import { LoginForm } from "./LoginForm";

const TABS = [
  { href: "/manage", label: "TikTok videos" },
  { href: "/manage/blog", label: "Blog posts" },
];

/** Shared frame for the owner area: setup check, login, and tabs. */
export async function ManageShell({ active, children }: { active: string; children: ReactNode }) {
  const missing = missingSetup();
  const loggedIn = await isAuthorised();

  return (
    <div className={`${container} max-w-3xl py-10 sm:py-14`}>
      <p className="eyebrow flex items-center gap-2 text-muted">
        <span className="live-dot" aria-hidden /> Owner area
      </p>
      {loggedIn && missing.length === 0 && (
        <nav aria-label="Manage" className="mt-5 flex gap-1 border-b border-line">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              aria-current={t.href === active ? "page" : undefined}
              className="-mb-px border-b-2 border-transparent px-4 py-3 font-display text-lg font-semibold tracking-wide text-white/60 uppercase hover:text-white aria-[current=page]:border-brand aria-[current=page]:text-white"
            >
              {t.label}
            </Link>
          ))}
        </nav>
      )}

      {missing.length > 0 ? (
        <div className="mt-8 border border-line bg-surface p-6">
          <p className="font-semibold">This page isn’t switched on yet.</p>
          <p className="mt-2 text-white/75">
            In Vercel, open <strong>Settings → Environment Variables</strong>, add
            {missing.map((m) => (
              <code key={m} className="mx-1 font-mono text-sm text-brand-text">
                {m}
              </code>
            ))}
            and redeploy.
          </p>
        </div>
      ) : loggedIn ? (
        children
      ) : (
        <>
          <h1 className="display mt-4 text-title">Log in</h1>
          <LoginForm />
        </>
      )}
    </div>
  );
}
