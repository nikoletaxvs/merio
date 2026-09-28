"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function PaymentError({
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
          We couldn&apos;t load your payment
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted">
          This is a problem on our side, not with your link. Try again in a
          moment.
        </p>

        <Button onClick={() => retry()} className="mt-6">
          Try again
        </Button>
      </div>
    </main>
  );
}
