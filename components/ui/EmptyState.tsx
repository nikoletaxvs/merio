import type { ReactNode } from "react";
import { MerioMark } from "./MerioMark";

/**
 * Full-page message for when there's nothing to show: not found, no data
 * yet, or an error. `tone="error"` announces it to screen readers.
 */
export function EmptyState({
  title,
  children,
  action,
  tone = "info",
}: {
  title: string;
  /** Explanation under the title. */
  children: ReactNode;
  /** Optional button or link, e.g. "Try again". */
  action?: ReactNode;
  tone?: "info" | "error";
}) {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center px-6 py-16">
      <div
        role={tone === "error" ? "alert" : undefined}
        className="flex w-full max-w-sm flex-col items-center text-center"
      >
        <MerioMark className="h-10 w-10" />

        <h1 className="mt-6 font-display text-2xl font-medium">{title}</h1>

        <div className="mt-2 text-sm leading-6 text-muted">{children}</div>

        {action && <div className="mt-6">{action}</div>}
      </div>
    </main>
  );
}
