import Link from "next/link";
import { container } from "@/components/ui";

export default function NotFound() {
  return (
    <div className={`${container} flex flex-col items-center py-24 text-center`}>
      <p className="eyebrow flex items-center gap-2 text-brand-text">
        <span className="live-dot" aria-hidden /> 404
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">This page is off air</h1>
      <p className="mt-3 max-w-md text-white/80">The page you’re looking for doesn’t exist or has moved.</p>
      <Link href="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-6 font-bold text-black hover:bg-white/90">
        Back to the latest videos
      </Link>
    </div>
  );
}
