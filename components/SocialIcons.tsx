import { PLATFORM_ORDER, platformMeta } from "@/lib/platforms";
import { profileUrl } from "@/lib/site";
import { PlatformIcon } from "./Icons";

/** Round white social buttons, as in the reference footer. */
export function SocialIcons({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "size-9" : "size-11";
  return (
    <ul className="flex items-center gap-3">
      {PLATFORM_ORDER.map((p) => (
        <li key={p}>
          <a
            href={profileUrl(p)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${dim} inline-flex items-center justify-center rounded-full bg-white text-black transition hover:scale-105 hover:bg-white/90`}
          >
            <PlatformIcon platform={p} className={size === "sm" ? "size-4" : "size-5"} />
            <span className="sr-only">Sabbir LIVE on {platformMeta[p].name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
