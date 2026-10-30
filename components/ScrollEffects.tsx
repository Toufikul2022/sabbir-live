"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Site-wide scroll behaviour:
 * - red reading-progress bar along the top edge
 * - `data-scrolled` on <html> once the page moves (the header tightens up)
 * - elements marked `data-reveal` slide in as they enter the viewport
 */
export function ScrollEffects() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      document.documentElement.toggleAttribute("data-scrolled", window.scrollY > 8);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"));
    // Anything already on screen shows immediately, so nothing flashes on load.
    for (const el of els) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add("is-visible");
    }
    document.documentElement.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => !el.classList.contains("is-visible") && io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]" aria-hidden>
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-brand" />
    </div>
  );
}
