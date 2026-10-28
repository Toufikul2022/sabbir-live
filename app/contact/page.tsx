import { ContactForm } from "@/components/ContactForm";
import { MailIcon, PlatformIcon } from "@/components/Icons";
import { container } from "@/components/ui";
import { PLATFORM_ORDER, platformMeta } from "@/lib/platforms";
import { pageMetadata } from "@/lib/seo";
import { profileUrl, siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description: `Get in touch with ${siteConfig.creatorName} (${siteConfig.brandName}) for collaborations, brand partnerships and enquiries.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className={`${container} grid gap-10 py-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16`}>
      <div>
        <p className="eyebrow flex items-center gap-2 text-white/80">
          <span className="live-dot" aria-hidden /> Contact
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Let’s work together</h1>
        <p className="mt-4 max-w-lg text-lg text-white/80">{siteConfig.contact.intro}</p>

        {siteConfig.contact.email && (
          <a href={`mailto:${siteConfig.contact.email}`} className="mt-8 inline-flex items-center gap-3 font-semibold hover:underline">
            <MailIcon className="size-5" /> {siteConfig.contact.email}
          </a>
        )}

        <h2 className="eyebrow mt-10 text-muted">Find me on</h2>
        <ul className="mt-4 space-y-3">
          {PLATFORM_ORDER.map((p) => {
            const social = siteConfig.social[p];
            return (
              <li key={p}>
                <a
                  href={profileUrl(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-14 items-center gap-4 rounded-xl bg-surface px-4 ring-1 ring-white/10 transition hover:ring-white/30"
                >
                  <PlatformIcon platform={p} className="size-6" />
                  <span className="font-semibold">{platformMeta[p].name}</span>
                  <span className="ml-auto truncate text-sm text-muted">{"handle" in social ? `@${social.handle}` : social.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h2 className="sr-only">Send a message</h2>
        <ContactForm facebookUrl={profileUrl("facebook")} />
      </div>
    </div>
  );
}
