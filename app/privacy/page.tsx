import { container } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How the ${siteConfig.brandName} website handles your information.`,
  path: "/privacy",
});

// Describes what this website actually does. Review it (and add a contact
// email in content/site.json) before launch; it is not legal advice.
export default function PrivacyPage() {
  const h2 = "display mt-12 text-3xl";
  const p = "mt-3 text-white/80";
  return (
    <article className={`${container} max-w-3xl py-12 sm:py-16`}>
      <h1 className="display text-6xl sm:text-8xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted">Applies to this website, operated by {siteConfig.creatorName} ({siteConfig.brandName}).</p>

      <h2 className={h2}>Contact form</h2>
      <p className={p}>
        When you send a message, the name, email address, subject and message you enter are emailed to me so I can reply. They are
        not used for marketing, sold, or shared with anyone else, apart from the email provider that delivers the message.
      </p>

      <h2 className={h2}>Embedded videos and social media</h2>
      <p className={p}>
        Videos on this site are played using the official embedded players of Facebook, TikTok and YouTube. Nothing is loaded from
        those platforms until you press play (or choose to load a profile feed). Once loaded, those players are provided by the
        platform and are covered by its own privacy policy, which may include cookies. YouTube videos use YouTube’s
        privacy-enhanced (no-cookie) mode.
      </p>
      <p className={p}>Thumbnails may be loaded from the platforms’ image servers.</p>

      <h2 className={h2}>Cookies and analytics</h2>
      <p className={p}>This website itself does not set tracking cookies or use analytics.</p>

      <h2 className={h2}>Questions</h2>
      <p className={p}>
        For any privacy question or to ask for a message you sent to be deleted, use the{" "}
        <a href="/contact" className="font-semibold text-white underline">
          contact page
        </a>
        {siteConfig.contact.email ? (
          <>
            {" "}or email{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold text-white underline">
              {siteConfig.contact.email}
            </a>
          </>
        ) : null}
        .
      </p>
    </article>
  );
}
