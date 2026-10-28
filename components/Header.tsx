"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, FacebookIcon, MenuIcon, PlatformIcon } from "./Icons";
import { LogoLink } from "./Logo";
import { NAV } from "@/lib/nav";

export function Header({ facebookUrl }: { facebookUrl: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu on navigation and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const followPill = (
    <a
      href={facebookUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-9 items-center gap-2 rounded-full bg-facebook px-3.5 text-sm font-bold whitespace-nowrap text-white transition hover:brightness-110 sm:h-10 sm:px-4"
    >
      <span className="live-dot" aria-hidden />
      <span className="sm:hidden">Follow</span>
      <span className="hidden sm:inline">Follow on Facebook</span>
      <span className="sr-only"> (opens Facebook)</span>
    </a>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur supports-[backdrop-filter]:bg-ink/75">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-black"
      >
        Skip to content
      </a>
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:h-[4.5rem] sm:px-6 lg:flex lg:justify-between">
        {/* Mobile: hamburger · centred logo · follow pill (as in the reference) */}
        <button
          ref={buttonRef}
          type="button"
          className="-ml-2 inline-flex size-11 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>

        <div className="flex justify-center lg:justify-start">
          <LogoLink priority className="h-7 w-auto min-[400px]:h-8 sm:h-9" />
        </div>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="relative inline-flex h-10 items-center gap-2 rounded-lg px-3.5 text-[0.95rem] font-semibold text-white/80 transition hover:bg-white/5 hover:text-white aria-[current=page]:text-white aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3.5 aria-[current=page]:after:-bottom-[0.95rem] aria-[current=page]:after:h-[3px] aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-brand"
                >
                  {item.platform && <PlatformIcon platform={item.platform} className="size-4" />}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex justify-end lg:ml-2">{followPill}</div>
      </div>

      {/* Mobile menu */}
      <nav
        id="mobile-nav"
        aria-label="Main"
        hidden={!open}
        className="border-t border-white/10 bg-ink lg:hidden"
      >
        <ul className="mx-auto max-w-7xl px-4 py-3">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-lg font-semibold text-white/85 hover:bg-white/5 aria-[current=page]:bg-white/[0.07] aria-[current=page]:text-white"
              >
                {item.platform ? (
                  <PlatformIcon platform={item.platform} className="size-5" />
                ) : (
                  <span className="size-5" aria-hidden />
                )}
                {item.label}
              </Link>
            </li>
          ))}
          <li className="mt-3 border-t border-white/10 pt-4 pb-2">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-facebook px-5 font-bold text-white"
            >
              <FacebookIcon className="size-5" /> Follow on Facebook
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
