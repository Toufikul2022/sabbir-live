import { NextResponse } from "next/server";
import { checkPassword, newSessionValue, SESSION_COOKIE } from "@/lib/manage/auth";

export const runtime = "nodejs";

// Slow down password guessing: 10 attempts per IP per 15 minutes (per server instance).
const attempts = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < 15 * 60 * 1000);
  if (recent.length >= 10) {
    return NextResponse.json({ message: "Too many attempts. Please wait 15 minutes." }, { status: 429 });
  }

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!process.env.MANAGE_PASSWORD) {
    return NextResponse.json({ message: "MANAGE_PASSWORD isn't set in Vercel yet." }, { status: 503 });
  }
  if (typeof password !== "string" || !checkPassword(password)) {
    attempts.set(ip, [...recent, now]);
    return NextResponse.json({ message: "Wrong password." }, { status: 401 });
  }

  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, newSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
