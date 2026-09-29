"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button, EmptyState } from "@/components/ui";

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
    <EmptyState
      tone="error"
      title="We couldn't load your payment"
      action={<Button onClick={() => retry()}>Try again</Button>}
    >
      This is a problem on our side, not with your link. Try again in a moment.
    </EmptyState>
  );
}
