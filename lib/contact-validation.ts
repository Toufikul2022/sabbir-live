// Shared by the contact form (instant feedback) and the API route (authoritative check).

export type ContactInput = { name: string; email: string; subject: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

export const LIMITS = { name: 100, email: 200, subject: 150, message: 5000 } as const;

// Pragmatic check: something@something.tld, no spaces.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(raw: Partial<Record<keyof ContactInput, unknown>>): {
  data: ContactInput;
  errors: ContactErrors;
} {
  const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const data: ContactInput = { name: s(raw.name), email: s(raw.email), subject: s(raw.subject), message: s(raw.message) };
  const errors: ContactErrors = {};

  if (!data.name) errors.name = "Please enter your full name.";
  else if (data.name.length > LIMITS.name) errors.name = `Name must be ${LIMITS.name} characters or fewer.`;

  if (!data.email) errors.email = "Please enter your email address.";
  else if (data.email.length > LIMITS.email || !EMAIL.test(data.email)) errors.email = "Please enter a valid email address.";

  if (!data.subject) errors.subject = "Please enter a subject.";
  else if (data.subject.length > LIMITS.subject) errors.subject = `Subject must be ${LIMITS.subject} characters or fewer.`;

  if (!data.message) errors.message = "Please enter a message.";
  else if (data.message.length < 10) errors.message = "Your message is a bit short — please add some detail.";
  else if (data.message.length > LIMITS.message) errors.message = `Message must be ${LIMITS.message} characters or fewer.`;

  return { data, errors };
}
