import type { ReactNode } from "react";

/** Broadcast-style scrolling ticker. Content is duplicated once for a seamless loop. */
export function Ticker({ items, tone = "red" }: { items: ReactNode[]; tone?: "red" | "dark" }) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-6 px-6 whitespace-nowrap">
          <span className="display text-[1.35rem] leading-none tracking-wide sm:text-2xl">{item}</span>
          <span className={`size-1.5 rotate-45 ${tone === "red" ? "bg-black" : "bg-brand"}`} aria-hidden />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`overflow-hidden py-3 ${tone === "red" ? "bg-brand text-white" : "border-y border-line bg-surface text-white"}`}>
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
