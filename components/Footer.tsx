import Link from "next/link";
import { PLATFORM_ORDER, platformMeta } from "@/lib/platforms";
import { profileUrl, siteConfig } from "@/lib/site";
import { NAV } from "@/lib/nav";
import { LogoLink } from "./Logo";
import { SocialIcons } from "./SocialIcons";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-white/15 bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-6 border-b border-white/15 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <LogoLink className="h-9 w-auto sm:h-10" />
          <SocialIcons />
        </div>

        <div className="grid gap-10 pt-8 sm:grid-cols-3">
          <nav aria-label="Footer">
            <h2 className="eyebrow mb-4 text-muted">Explore</h2>
            <ul className="space-y-3">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="font-display text-base font-semibold tracking-wide uppercase hover:text-brand-text">
                    {n.label === "Home" ? "Home" : n.platform ? `${n.label} videos` : n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="eyebrow mb-4 text-muted">Follow</h2>
            <ul className="space-y-3 text-sm">
              {PLATFORM_ORDER.map((p) => (
                <li key={p}>
                  <a href={profileUrl(p)} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                    {platformMeta[p].name}
                    {p !== "facebook" && <span className="text-muted"> · @{siteConfig.social[p].handle}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow mb-4 text-muted">Get in touch</h2>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/contact" className="font-semibold hover:underline">
                  Contact &amp; collaborations
                </Link>
              </li>
              {siteConfig.contact.email && (
                <li>
                  <a href={`mailto:${siteConfig.contact.email}`} className="font-semibold hover:underline">
                    {siteConfig.contact.email}
                  </a>
                </li>
              )}
              <li>
                <Link href="/privacy" className="font-semibold hover:underline">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 text-sm text-muted">
          Copyright © {year} {siteConfig.creatorName} · {siteConfig.brandName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
