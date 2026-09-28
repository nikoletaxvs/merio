import { Skeleton } from "@/components/ui";

// Members usually arrive from an email on their phone, often on a slow
// connection, so show the page's shape straight away.
export default function Loading() {
  return (
    <main className="min-h-screen w-full">
      <div role="status" className="mx-auto w-full max-w-md px-5 py-10 sm:px-6">
        <span className="sr-only">Loading your payment…</span>

        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-4 w-32" />
        </div>

        <Skeleton className="mt-8 h-10 w-48" />
        <Skeleton className="mt-3 h-5 w-64" />

        <Skeleton className="mt-8 h-72 w-full rounded-md" />
      </div>
    </main>
  );
}
