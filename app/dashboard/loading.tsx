import { Skeleton } from "@/components/ui";

// Shown instantly while page.tsx fetches from the database. Next.js wraps the
// page in <Suspense fallback={<Loading />}> for us. The shapes mirror the real
// layout so nothing jumps when the content arrives.
export default function Loading() {
  return (
    <main className="min-h-dvh w-full">
      <div
        role="status"
        className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-6 sm:py-12"
      >
        <span className="sr-only">Loading dashboard…</span>

        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        <Skeleton className="mt-8 h-4 w-40" />
        <div className="mt-3 flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-2 flex-1" />
          ))}
        </div>

        <Skeleton className="mt-10 h-24 w-full rounded-md" />

        <Skeleton className="mt-12 h-6 w-32" />
        <div className="mt-4 divide-y divide-border border-y border-border">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-1 py-4">
              <Skeleton className="h-9 w-9 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
