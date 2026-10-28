// Validates content/videos.json and content/site.json.
// Usage: npm run check:content
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseVideoUrl } from "../lib/video-url.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];

const readJson = (rel) => {
  try {
    return JSON.parse(readFileSync(join(root, rel), "utf8"));
  } catch (e) {
    errors.push(`${rel}: invalid JSON — ${e.message}`);
    return null;
  }
};

const videos = readJson("content/videos.json");
const site = readJson("content/site.json");

if (videos) {
  if (!Array.isArray(videos.videos)) errors.push('content/videos.json must look like { "videos": [ … ] }');
  const seen = new Map();
  const counts = { facebook: 0, tiktok: 0, youtube: 0 };
  (videos.videos ?? []).forEach((v, i) => {
    const where = `Video #${i + 1}${v?.title ? ` ("${v.title}")` : ""}`;
    if (!v || typeof v.url !== "string" || !v.url.trim()) return errors.push(`${where}: missing "url".`);
    const p = parseVideoUrl(v.url);
    if (!p.ok) return errors.push(`${where}: ${p.error} (${v.url})`);
    counts[p.platform]++;
    if (p.needsResolve)
      warnings.push(`${where}: ${v.url} is a share/short link. The site will try to resolve it, but a full link (open it in a browser and copy the address) is more reliable.`);
    const key = p.id ? `${p.platform}:${p.id}` : v.url;
    if (seen.has(key)) warnings.push(`${where}: duplicate of video #${seen.get(key) + 1}.`);
    seen.set(key, i);
    if (v.publishedAt && Number.isNaN(new Date(v.publishedAt).getTime())) errors.push(`${where}: "publishedAt" is not a valid date (use YYYY-MM-DD).`);
    if (v.format && !["auto", "vertical", "landscape"].includes(v.format)) errors.push(`${where}: "format" must be auto, vertical or landscape.`);
    if (v.priority !== undefined && !Number.isFinite(v.priority)) errors.push(`${where}: "priority" must be a number.`);
    if (v.thumbnail?.startsWith("/") && !existsSync(join(root, "public", v.thumbnail))) errors.push(`${where}: thumbnail file public${v.thumbnail} not found.`);
    if (p.platform === "facebook" && !v.thumbnail) warnings.push(`${where}: Facebook videos have no automatic thumbnail — add one for a nicer card.`);
    if (p.platform === "facebook" && !v.title) warnings.push(`${where}: Facebook titles aren't fetched automatically — add a title.`);
  });
  console.log(`Videos: ${counts.facebook} Facebook · ${counts.tiktok} TikTok · ${counts.youtube} YouTube`);
}

if (site) {
  for (const p of ["facebook", "tiktok", "youtube"]) {
    const url = site.social?.[p]?.url;
    if (!url || !/^https:\/\//.test(url)) errors.push(`content/site.json: social.${p}.url must be a full https:// link.`);
  }
  if (!site.social?.facebook?.pageUrl) warnings.push("content/site.json: social.facebook.pageUrl is empty — the Facebook 'Latest posts' feed stays hidden.");
  if (!site.social?.youtube?.channelId && !process.env.YOUTUBE_CHANNEL_ID) warnings.push("content/site.json: social.youtube.channelId is empty — YouTube uploads won't be added automatically.");
}

for (const w of warnings) console.warn(`⚠  ${w}`);
for (const e of errors) console.error(`✖  ${e}`);
console.log(errors.length ? `\n${errors.length} error(s) found.` : "\n✔ Content looks good.");
process.exit(errors.length ? 1 : 0);
