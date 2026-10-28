import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import logo from "@/public/brand/logo-640.png";

export function Logo({ className = "h-8 w-auto sm:h-9", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image src={logo} alt={siteConfig.brandName} className={className} priority={priority} sizes="200px" />
  );
}

export function LogoLink({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/" aria-label={`${siteConfig.brandName} — home`} className="inline-flex shrink-0 items-center">
      <Logo className={className} priority={priority} />
    </Link>
  );
}
