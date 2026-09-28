"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui";

// Catches anything thrown while rendering the dashboard (e.g. the database is
// unreachable) and replaces the page with this instead of a blank screen.
export default function DashboardError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6">
      <div role="alert" className="max-w-sm text-center">
        <h1 className="font-display text-2xl font-medium">
          The dashboard couldn&apos;t load
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted">
          Something went wrong on our side. Your data is safe. Try again in a
          moment.
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted">
            Reference: {error.digest}
          </p>
        )}

        {/* retry() re-fetches the page's data, unlike reset() which only re-renders. */}
        <Button onClick={() => retry()} className="mt-6">
          Try again
        </Button>
      </div>
    </main>
  );
}
