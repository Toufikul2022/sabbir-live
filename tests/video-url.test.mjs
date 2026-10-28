import assert from "node:assert/strict";
import { test } from "node:test";
import { parseVideoUrl } from "../lib/video-url.ts";

test("YouTube watch, short links, Shorts and embeds", () => {
  const w = parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s");
  assert.equal(w.ok && w.platform, "youtube");
  assert.equal(w.ok && w.id, "dQw4w9WgXcQ");
  assert.equal(w.ok && w.orientation, "landscape");
  assert.match(w.ok ? w.embedUrl : "", /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?/);

  const s = parseVideoUrl("https://youtube.com/shorts/abcdefghijk?si=xyz");
  assert.equal(s.ok && s.kind, "short");
  assert.equal(s.ok && s.orientation, "vertical");
  assert.equal(s.ok && s.watchUrl, "https://www.youtube.com/shorts/abcdefghijk");

  assert.equal(parseVideoUrl("https://youtu.be/abcdefghijk").ok, true);
  assert.equal(parseVideoUrl("https://m.youtube.com/watch?v=abcdefghijk").ok, true);
  assert.equal(parseVideoUrl("https://www.youtube.com/@sabbirlive").ok, false);
});

test("TikTok video links", () => {
  const t = parseVideoUrl("https://www.tiktok.com/@sabbirlive.official/video/7301234567890123456?lang=en");
  assert.equal(t.ok && t.platform, "tiktok");
  assert.equal(t.ok && t.id, "7301234567890123456");
  assert.equal(t.ok && t.watchUrl, "https://www.tiktok.com/@sabbirlive.official/video/7301234567890123456");
  assert.equal(t.ok && t.embedUrl?.startsWith("https://www.tiktok.com/player/v1/7301234567890123456?"), true);

  const short = parseVideoUrl("https://vm.tiktok.com/ZMabc123/");
  assert.equal(short.ok && short.needsResolve, true);
  assert.equal(short.ok && short.embedUrl, null);

  assert.equal(parseVideoUrl("https://www.tiktok.com/@sabbirlive.official").ok, false);
});

test("Facebook reels, watch and page video links", () => {
  const r = parseVideoUrl("https://www.facebook.com/reel/1234567890123456/?mibextid=abc");
  assert.equal(r.ok && r.kind, "reel");
  assert.equal(r.ok && r.orientation, "vertical");
  assert.equal(r.ok && r.watchUrl, "https://www.facebook.com/reel/1234567890123456");
  assert.match(r.ok ? r.embedUrl : "", /^https:\/\/www\.facebook\.com\/plugins\/video\.php\?href=https%3A%2F%2Fwww\.facebook\.com%2Freel%2F1234567890123456/);

  const w = parseVideoUrl("https://m.facebook.com/watch/?v=1234567890123456");
  assert.equal(w.ok && w.id, "1234567890123456");
  assert.equal(w.ok && w.orientation, "landscape");

  const pv = parseVideoUrl("https://www.facebook.com/SomePage/videos/a-title/1234567890123456/");
  assert.equal(pv.ok && pv.id, "1234567890123456");

  const share = parseVideoUrl("https://www.facebook.com/share/r/1AbCdEf/");
  assert.equal(share.ok && share.needsResolve, true);
  assert.equal(share.ok && share.kind, "reel");

  assert.equal(parseVideoUrl("https://www.facebook.com/share/19HjXcQMge/").ok, false); // a Page, not a video
});

test("rejects other sites and junk", () => {
  assert.equal(parseVideoUrl("https://vimeo.com/123").ok, false);
  assert.equal(parseVideoUrl("not a url").ok, false);
  assert.equal(parseVideoUrl("javascript:alert(1)").ok, false);
});
