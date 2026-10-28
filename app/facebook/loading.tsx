import { container, SkeletonGrid } from "@/components/ui";

export default function Loading() {
  return (
    <div className={`${container} py-14`} role="status" aria-live="polite">
      <span className="sr-only">Loading videos…</span>
      <div className="mb-10 h-12 w-72 animate-pulse rounded-lg bg-surface-2" />
      <SkeletonGrid />
    </div>
  );
}
