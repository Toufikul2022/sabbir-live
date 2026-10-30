"use client";

import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { LIMITS, validateContact, type ContactErrors, type ContactInput } from "@/lib/contact-validation";
import { AlertIcon, CheckIcon } from "./Icons";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent"; name: string }
  | { state: "error"; message: string; notConfigured?: boolean };

const FIELDS: { name: keyof ContactInput; label: string; type?: string; autoComplete?: string }[] = [
  { name: "name", label: "Full Name", autoComplete: "name" },
  { name: "email", label: "Email Address", type: "email", autoComplete: "email" },
  { name: "subject", label: "Subject" },
];

declare global {
  interface Window {
    turnstile?: { reset: (el?: string | HTMLElement) => void };
  }
}

export function ContactForm({ facebookUrl }: { facebookUrl: string }) {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd) as Record<string, string>;
    const { data, errors: found } = validateContact(raw);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus({ state: "error", message: "Please fix the highlighted fields." });
      const first = Object.keys(found)[0];
      (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }

    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...data,
          website: raw.website ?? "",
          startedAt: startedAt.current,
          turnstileToken: raw["cf-turnstile-response"] ?? "",
        }),
      });
      const out = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; error?: string; fields?: ContactErrors };
      if (res.ok && out.ok) {
        setStatus({ state: "sent", name: data.name.split(" ")[0] });
        formRef.current?.reset();
        setErrors({});
        return;
      }
      if (out.fields) setErrors(out.fields);
      setStatus({
        state: "error",
        message: out.message ?? "Something went wrong. Please try again.",
        notConfigured: out.error === "not_configured",
      });
    } catch {
      setStatus({ state: "error", message: "Network error — check your connection and try again." });
    } finally {
      if (TURNSTILE_SITE_KEY) window.turnstile?.reset();
    }
  }

  if (status.state === "sent") {
    return (
      <div role="status" className="flex flex-col items-start gap-4 border border-emerald-400/40 bg-surface p-8">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
          <CheckIcon className="size-6" />
        </span>
        <h2 className="display text-4xl">Thanks{status.name ? `, ${status.name}` : ""}! Your message has been sent.</h2>
        <p className="text-white/80">I’ll get back to you as soon as I can.</p>
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now();
            setStatus({ state: "idle" });
          }}
          className="mt-2 inline-flex h-11 items-center rounded-full px-5 text-sm font-bold ring-1 ring-white/30 hover:bg-white hover:text-black"
        >
          Send another message
        </button>
      </div>
    );
  }

  const input =
    "mt-2 block w-full rounded-sm border-0 bg-surface-2 px-4 py-3 text-base text-white ring-1 ring-white/15 placeholder:text-white/40 focus:ring-2 focus:ring-tiktok-cyan focus:outline-none aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-brand-text";

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6 border border-line bg-surface p-5 sm:p-8">
      {FIELDS.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="eyebrow text-white/85">
            {f.label} <span className="text-brand-text" aria-hidden>*</span>
          </label>
          <input
            id={f.name}
            name={f.name}
            type={f.type ?? "text"}
            autoComplete={f.autoComplete}
            required
            maxLength={LIMITS[f.name]}
            aria-invalid={errors[f.name] ? true : undefined}
            aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
            className={input}
          />
          {errors[f.name] && (
            <p id={`${f.name}-error`} className="mt-1.5 text-sm text-brand-text">
              {errors[f.name]}
            </p>
          )}
        </div>
      ))}
      <div>
        <label htmlFor="message" className="eyebrow text-white/85">
          Message <span className="text-brand-text" aria-hidden>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          maxLength={LIMITS.message}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${input} resize-y`}
        />
        {errors.message && (
          <p id="message-error" className="mt-1.5 text-sm text-brand-text">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {TURNSTILE_SITE_KEY && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="dark" />
        </>
      )}

      <div aria-live="polite" role="status">
        {status.state === "error" && (
          <p className="flex items-start gap-2 rounded-xl bg-brand/10 p-3 text-sm text-white ring-1 ring-brand-text/50">
            <AlertIcon className="mt-0.5 size-4 shrink-0 text-brand-text" />
            <span>
              {status.message}
              {status.notConfigured && (
                <>
                  {" "}
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                    Message me on Facebook
                  </a>
                </>
              )}
            </span>
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status.state === "sending"}
        className="btn-sweep inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand-strong px-9 text-base font-semibold text-white transition-colors duration-300 [--sweep:#ffffff] hover:text-black disabled:opacity-60 sm:w-auto"
      >
        {status.state === "sending" ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden /> Sending…
          </>
        ) : (
          "Send Message"
        )}
      </button>
      <p className="text-xs text-muted">
        Fields marked <span className="text-brand-text">*</span> are required. Your details are only used to reply to your message.
      </p>
    </form>
  );
}
