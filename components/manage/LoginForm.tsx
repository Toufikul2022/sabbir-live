"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/manage/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) return router.refresh();
    setError(((await res?.json().catch(() => null)) as { message?: string } | null)?.message ?? "Network error — please try again.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4 border border-line bg-surface p-5 sm:p-8">
      <label htmlFor="password" className="eyebrow block text-white/85">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="block h-14 w-full rounded-sm bg-surface-2 px-4 text-lg ring-1 ring-white/15 focus:ring-2 focus:ring-tiktok-cyan focus:outline-none"
      />
      {error && (
        <p role="alert" className="text-brand-text">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="btn-sweep h-14 w-full rounded-full bg-white text-lg font-semibold text-black transition-colors [--sweep:var(--color-tiktok)] hover:text-white disabled:opacity-60"
      >
        {busy ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
