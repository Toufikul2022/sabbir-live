import Link from "next/link";
import { NAV } from "@/lib/nav";
import { PLATFORM_ORDER, platformMeta } from "@/lib/platforms";
import { profileUrl, siteConfig } from "@/lib/site";
import { ArrowRightIcon } from "./Icons";
import { LogoLink } from "./Logo";
import { SocialIcons } from "./SocialIcons";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 bg-ink sm:mt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Closing call to action */}
        <Link href="/contact" className="group block border-y border-line py-10 sm:py-12" data-reveal>
          <span className="eyebrow flex items-center gap-2 text-muted">
            <span className="live-dot" aria-hidden /> Collaborations · Brands · Hello
          </span>
          <span className="display mt-4 flex items-end justify-between gap-6 text-mega">
            <span>
              Let’s work <span className="text-brand transition-colors duration-300 group-hover:text-white">together</span>
            </span>
            <ArrowRightIcon className="mb-[0.12em] size-[0.55em] shrink-0 -rotate-45 text-brand transition duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-0 group-hover:text-white" />
          </span>
        </Link>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <LogoLink className="h-9 w-auto sm:h-10" />
            <p className="mt-5 max-w-xs text-white/70">{siteConfig.hero.text}</p>
            <div className="mt-6">
              <SocialIcons />
            </div>
          </div>
          <nav aria-label="Footer">
            <h2 className="eyebrow mb-4 text-muted">Explore</h2>
            <ul className="space-y-2.5">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="link-sweep font-display text-xl font-semibold tracking-wide uppercase">
                    {n.platform ? `${n.label} videos` : n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="eyebrow mb-4 text-muted">Follow</h2>
            <ul className="space-y-2.5">
              {PLATFORM_ORDER.map((p) => (
                <li key={p}>
                  <a href={profileUrl(p)} target="_blank" rel="noopener noreferrer" className="link-sweep font-display text-xl font-semibold tracking-wide uppercase">
                    {platformMeta[p].name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow mb-4 text-muted">Info</h2>
            <ul className="space-y-2.5">
              <li>
                <Link href="/contact" className="link-sweep font-display text-xl font-semibold tracking-wide uppercase">
                  Contact
                </Link>
              </li>
              {siteConfig.contact.email && (
                <li>
                  <a href={`mailto:${siteConfig.contact.email}`} className="link-sweep text-white/80">
                    {siteConfig.contact.email}
                  </a>
                </li>
              )}
              <li>
                <Link href="/privacy" className="link-sweep font-display text-xl font-semibold tracking-wide uppercase">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="eyebrow flex flex-col gap-2 border-t border-line py-6 text-muted sm:flex-row sm:justify-between">
          <p>
            © {year} {siteConfig.creatorName} · {siteConfig.brandName}
          </p>
          <p>All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
