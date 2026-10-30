"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV } from "@/lib/nav";
import { ArrowRightIcon, CloseIcon, FacebookIcon, MenuIcon } from "./Icons";
import { LogoLink } from "./Logo";

export function Header({ facebookUrl }: { facebookUrl: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-ink transition-colors duration-300 scrolled:border-line scrolled:bg-ink/85 scrolled:backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-black"
      >
        Skip to content
      </a>
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 transition-[height] duration-300 sm:h-20 sm:px-6 lg:flex lg:justify-between scrolled:sm:h-16">
        <button
          ref={buttonRef}
          type="button"
          className="-ml-2 inline-flex size-11 items-center justify-center text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>

        <div className="flex justify-center lg:justify-start">
          <LogoLink priority className="h-7 w-auto transition-[height] duration-300 min-[400px]:h-8 sm:h-9 scrolled:sm:h-8" />
        </div>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="group relative inline-flex h-11 items-center px-4 font-display text-[1.05rem] font-semibold tracking-[0.08em] text-white/70 uppercase transition-colors hover:text-white aria-[current=page]:text-white"
                >
                  {item.label}
                  <span
                    className="absolute inset-x-4 bottom-1.5 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-x-100 group-aria-[current=page]:scale-x-100"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex justify-end lg:ml-4">
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sweep inline-flex h-9 items-center gap-2 rounded-full bg-facebook px-3.5 text-sm font-semibold whitespace-nowrap text-white [--sweep:#ffffff] hover:text-black sm:h-10 sm:px-4"
          >
            <span className="live-dot" aria-hidden />
            <span className="sm:hidden">Follow</span>
            <span className="hidden sm:inline">Follow on Facebook</span>
            <span className="sr-only"> (opens Facebook)</span>
          </a>
        </div>
      </div>

      <nav id="mobile-nav" aria-label="Main" hidden={!open} className="border-t border-line bg-ink lg:hidden">
        <ul className="mx-auto max-w-7xl px-4 pt-2 pb-5">
          {NAV.map((item, i) => (
            <li key={item.href} className="border-b border-line">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="group flex min-h-14 items-center gap-4 font-display text-3xl font-bold tracking-wide text-white/80 uppercase aria-[current=page]:text-white"
              >
                <span className="w-7 font-mono text-xs font-medium text-muted">{String(i + 1).padStart(2, "0")}</span>
                {item.label}
                <ArrowRightIcon className="ml-auto size-5 text-brand opacity-0 transition group-aria-[current=page]:opacity-100" />
              </Link>
            </li>
          ))}
          <li className="pt-5">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-facebook px-5 font-semibold text-white"
            >
              <FacebookIcon className="size-5" /> Follow on Facebook
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
