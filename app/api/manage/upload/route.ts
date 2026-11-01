import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isAuthorised } from "@/lib/manage/auth";
import { writeFile } from "@/lib/manage/github";

export const runtime = "nodejs";

const MAX_BYTES = 3 * 1024 * 1024;

/** Identify the image from its first bytes rather than trusting the file name. */
function imageExt(buf: Buffer) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

/** Saves a blog photo to public/uploads/blog/<year-month>/ and returns its public path. */
export async function POST(req: Request) {
  if (!(await isAuthorised())) return NextResponse.json({ message: "Please log in again." }, { status: 401 });
  const { data, name } = (await req.json().catch(() => ({}))) as { data?: string; name?: string };
  const buf = Buffer.from(typeof data === "string" ? data : "", "base64");
  const ext = imageExt(buf);
  if (!ext) return NextResponse.json({ message: "Please choose a JPG, PNG or WebP photo." }, { status: 400 });
  if (buf.length > MAX_BYTES) return NextResponse.json({ message: "That photo is too large (max 3 MB)." }, { status: 413 });

  const base = (name ?? "photo").replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "photo";
  const month = new Date().toISOString().slice(0, 7);
  const file = `uploads/blog/${month}/${base}-${randomBytes(3).toString("hex")}.${ext}`;
  try {
    await writeFile(`public/${file}`, buf, `Upload blog image ${file}`);
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 502 });
  }
  return NextResponse.json({ path: `/${file}` });
}
