import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "sl_manage";

/** The session token is an HMAC of the password, so changing MANAGE_PASSWORD logs everyone out. */
function sessionToken(password: string) {
  return createHmac("sha256", password).update("sabbir-live-manage-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(input: string) {
  const password = process.env.MANAGE_PASSWORD;
  return Boolean(password) && safeEqual(input, password!);
}

export function newSessionValue() {
  return sessionToken(process.env.MANAGE_PASSWORD!);
}

export function isValidSession(value: string | undefined) {
  const password = process.env.MANAGE_PASSWORD;
  return Boolean(password && value) && safeEqual(value!, sessionToken(password!));
}

/** What still needs configuring in Vercel before /manage can work. */
export function missingSetup() {
  return ["MANAGE_PASSWORD", "GITHUB_TOKEN"].filter((k) => !process.env[k]);
}
