import { NextResponse } from "next/server";
import { validateContact, type ContactInput } from "@/lib/contact-validation";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";

// Simple per-instance rate limit: 5 messages per IP per 10 minutes. Serverless
// instances don't share memory, so this is a speed bump, not a hard guarantee —
// enable Turnstile for stronger protection.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

async function verifyTurnstile(token: unknown, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    });
    const out = (await res.json()) as { success?: boolean };
    return Boolean(out.success);
  } catch {
    return false;
  }
}

function emailText(d: ContactInput) {
  return `New message from the ${siteConfig.brandName} website\n\nName: ${d.name}\nEmail: ${d.email}\nSubject: ${d.subject}\n\n${d.message}\n`;
}

async function deliver(d: ContactInput): Promise<"sent" | "not_configured" | "failed"> {
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER;
  if (!to || !from) return "not_configured";
  const subject = `[${siteConfig.brandName}] ${d.subject}`.slice(0, 200);

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ from, to: to.split(",").map((s) => s.trim()), reply_to: d.email, subject, text: emailText(d) }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) console.error(`[contact] Resend error ${res.status}: ${await res.text()}`);
      return res.ok ? "sent" : "failed";
    } catch (err) {
      console.error("[contact] Resend request failed", err);
      return "failed";
    }
  }

  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = await import("nodemailer");
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      });
      await transport.sendMail({ from, to, replyTo: `${d.name} <${d.email}>`, subject, text: emailText(d) });
      return "sent";
    } catch (err) {
      console.error("[contact] SMTP delivery failed", err);
      return "failed";
    }
  }

  return "not_configured";
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json(400, { error: "invalid_request", message: "Invalid request." });
  }

  // Honeypot filled in, or submitted faster than a human could type: pretend it worked.
  const startedAt = Number(body.startedAt);
  if (body.website || (Number.isFinite(startedAt) && Date.now() - startedAt < 2500)) {
    return json(200, { ok: true });
  }

  if (rateLimited(ip)) {
    return json(429, { error: "rate_limited", message: "Too many messages — please wait a few minutes and try again." });
  }

  const { data, errors } = validateContact(body);
  if (Object.keys(errors).length) {
    return json(422, { error: "validation", message: "Please fix the highlighted fields.", fields: errors });
  }

  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return json(400, { error: "captcha", message: "Spam check failed — please try again." });
  }

  const result = await deliver(data);
  if (result === "not_configured") {
    console.error("[contact] No email delivery configured. Set CONTACT_TO_EMAIL plus RESEND_API_KEY or SMTP_* (see README).");
    return json(503, {
      error: "not_configured",
      message: "The contact form isn't connected yet. Please reach out on Facebook in the meantime.",
    });
  }
  if (result === "failed") {
    return json(502, { error: "delivery_failed", message: "Your message couldn't be sent right now. Please try again later." });
  }
  return json(200, { ok: true });
}
