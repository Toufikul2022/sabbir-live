import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LoginForm } from "@/components/manage/LoginForm";
import { TikTokManager } from "@/components/manage/TikTokManager";
import { container } from "@/components/ui";
import { isValidSession, missingSetup, SESSION_COOKIE } from "@/lib/manage/auth";

export const metadata: Metadata = {
  title: "Manage videos",
  robots: { index: false, follow: false },
};

export default async function ManagePage() {
  const missing = missingSetup();
  const loggedIn = isValidSession((await cookies()).get(SESSION_COOKIE)?.value);

  return (
    <div className={`${container} max-w-2xl py-10 sm:py-16`}>
      <p className="eyebrow flex items-center gap-2 text-muted">
        <span className="live-dot" aria-hidden /> Owner area
      </p>
      <h1 className="display mt-4 text-title">
        Add <span className="text-tiktok">TikTok</span> videos
      </h1>

      {missing.length > 0 ? (
        <div className="mt-8 border border-line bg-surface p-6">
          <p className="font-semibold">This page isn’t switched on yet.</p>
          <p className="mt-2 text-white/75">
            In Vercel, open <strong>Settings → Environment Variables</strong>, add {missing.map((m) => <code key={m} className="mx-1 font-mono text-sm text-brand-text">{m}</code>)}
            and redeploy. See the README, section “Adding TikTok videos”.
          </p>
        </div>
      ) : loggedIn ? (
        <TikTokManager />
      ) : (
        <LoginForm />
      )}
    </div>
  );
}
