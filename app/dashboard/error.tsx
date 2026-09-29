"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button, EmptyState } from "@/components/ui";

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
    <EmptyState
      tone="error"
      title="The dashboard couldn't load"
      // retry() re-fetches the page's data, unlike reset() which only re-renders.
      action={<Button onClick={() => retry()}>Try again</Button>}
    >
      <p>
        Something went wrong on our side. Your data is safe. Try again in a
        moment.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs">Reference: {error.digest}</p>
      )}
    </EmptyState>
  );
}
