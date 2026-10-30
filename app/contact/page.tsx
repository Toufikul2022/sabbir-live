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
        <h1 className="display mt-6 text-hero">
          <span className="block overflow-hidden pb-[0.05em]"><span className="rise">Get in</span></span>
          <span className="block overflow-hidden pb-[0.06em]"><span className="rise text-brand [--rise-delay:120ms]">touch</span></span>
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75 sm:text-xl">{siteConfig.contact.intro}</p>

        {siteConfig.contact.email && (
          <a href={`mailto:${siteConfig.contact.email}`} className="mt-8 inline-flex items-center gap-3 font-semibold hover:underline">
            <MailIcon className="size-5" /> {siteConfig.contact.email}
          </a>
        )}

        <h2 className="eyebrow mt-10 text-muted">Find me on</h2>
        <ul className="mt-4 border-t border-line">
          {PLATFORM_ORDER.map((p) => {
            const social = siteConfig.social[p];
            return (
              <li key={p}>
                <a
                  href={profileUrl(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group btn-sweep flex min-h-16 items-center gap-4 border-b border-line px-1 transition-colors duration-300 [--sweep:var(--color-surface-3)] sm:px-4"
                >
                  <PlatformIcon platform={p} className="size-6" />
                  <span className="display text-3xl">{platformMeta[p].name}</span>
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
