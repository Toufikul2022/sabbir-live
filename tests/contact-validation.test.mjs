import assert from "node:assert/strict";
import { test } from "node:test";
import { validateContact } from "../lib/contact-validation.ts";

test("accepts a complete message and trims fields", () => {
  const { data, errors } = validateContact({ name: "  Jane Doe ", email: "jane@example.com", subject: "Collab", message: "Hello, I'd love to work together!" });
  assert.deepEqual(errors, {});
  assert.equal(data.name, "Jane Doe");
});

test("flags every missing field", () => {
  const { errors } = validateContact({});
  assert.deepEqual(Object.keys(errors).sort(), ["email", "message", "name", "subject"]);
});

test("rejects invalid emails and over-long input", () => {
  assert.ok(validateContact({ name: "A", email: "not-an-email", subject: "s", message: "long enough message" }).errors.email);
  assert.ok(validateContact({ name: "A", email: "a@b", subject: "s", message: "long enough message" }).errors.email);
  assert.ok(validateContact({ name: "A".repeat(101), email: "a@b.co", subject: "s", message: "long enough message" }).errors.name);
  assert.ok(validateContact({ name: "A", email: "a@b.co", subject: "s", message: "x".repeat(5001) }).errors.message);
});
