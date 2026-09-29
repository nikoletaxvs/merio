// Client component on purpose: "next generation date" depends on the
// viewer's timezone, so it must be computed in the browser, not on the
// server (UTC on Vercel).
"use client";

import { formatDateLong, nextGenerationDate } from "@/lib/billing/periods";
import Countdown from "./Countdown";

/** "Next payments are created on …" with a live countdown beside it. */
export default function PeriodCountdown({
  generationDay,
}: {
  generationDay: number;
}) {
  const next = nextGenerationDate(generationDay);

  return (
    <div className="mt-3 flex flex-col justify-between gap-3 px-1 text-sm sm:flex-row sm:items-center">
      <p className="text-muted">
        Next payments are created on{" "}
        <span className="font-medium tabular-nums text-foreground">{formatDateLong(next)}</span>
      </p>

      <Countdown target={next.getTime()} />
    </div>
  );
}
