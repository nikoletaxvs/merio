/** Placeholder block for loading states. Size it with className. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-sm bg-surface-muted ${className}`}
    />
  );
}
