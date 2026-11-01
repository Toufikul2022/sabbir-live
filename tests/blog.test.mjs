import assert from "node:assert/strict";
import { test } from "node:test";
import { isValidSlug, readingMinutes, slugify } from "../lib/blog-shared.ts";

test("slugify keeps Bengali and English words", () => {
  assert.equal(slugify("Hello, World!  2026"), "hello-world-2026");
  assert.equal(slugify("তৃতীয় টার্মিনালের ভেতরে"), "তৃতীয়-টার্মিনালের-ভেতরে");
  assert.ok(isValidSlug(slugify("তৃতীয় টার্মিনালের ভেতরে")));
  assert.match(slugify("!!!"), /^post-/);
});

test("rejects unsafe slugs", () => {
  assert.equal(isValidSlug("../etc/passwd"), false);
  assert.equal(isValidSlug("a/b"), false);
  assert.equal(isValidSlug(""), false);
});

test("reading time is at least one minute", () => {
  assert.equal(readingMinutes("short"), 1);
  assert.equal(readingMinutes("word ".repeat(1000)), 5);
});
