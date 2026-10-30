import { PLATFORM_ORDER, platformMeta } from "@/lib/platforms";
import { profileUrl } from "@/lib/site";
import { PlatformIcon } from "./Icons";

/** Round white social buttons, as in the reference footer. */
export function SocialIcons() {
  return (
    <ul className="flex items-center gap-3">
      {PLATFORM_ORDER.map((p) => (
        <li key={p}>
          <a
            href={profileUrl(p)}
            target="_blank"
            rel="noopener noreferrer"
            className={`size-11 inline-flex items-center justify-center rounded-full bg-white text-black transition duration-300 hover:-translate-y-0.5 hover:bg-brand hover:text-white`}
          >
            <PlatformIcon platform={p} className="size-5" />
            <span className="sr-only">Sabbir LIVE on {platformMeta[p].name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
