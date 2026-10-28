"use client";

import { container } from "@/components/ui";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={`${container} flex flex-col items-center py-24 text-center`} role="alert">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-white/80">The videos couldn’t be loaded right now. Please try again.</p>
      <button type="button" onClick={reset} className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-6 font-bold text-black hover:bg-white/90">
        Try again
      </button>
    </div>
  );
}
