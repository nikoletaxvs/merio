"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { formatPeriod, getNextPeriodStart, parseDate } from "@/lib/periods";

export default function PeriodCountdown({
  startDate,
}: {
  startDate: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());

    const timeout = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const nextStart = getNextPeriodStart(startDate);
  const nextEnd = getNextPeriodStart(startDate, parseDate(nextStart));

  const diff =
    now === null
      ? null
      : Math.max(0, parseDate(nextStart).getTime() - now);

  const days = diff === null ? null : Math.floor(diff / 86400000);
  const hours = diff === null ? null : Math.floor((diff % 86400000) / 3600000);
  const minutes = diff === null ? null : Math.floor((diff % 3600000) / 60000);
  const seconds = diff === null ? null : Math.floor((diff % 60000) / 1000);

  return (
    <Card className="mt-4 flex flex-col justify-between gap-5 border-white/10 bg-white/[0.04] shadow-none sm:flex-row sm:items-center">
      <div className="min-w-0">
        <p className="text-sm font-semibold">Next billing period</p>
        <p className="mt-1 text-sm leading-6 text-white/40">
          Starts {formatPeriod(nextStart, nextEnd)} — payments regenerate and
          reminder emails go out daily at 9:00 UTC.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {[
          { value: days, label: "days" },
          { value: hours, label: "hrs" },
          { value: minutes, label: "min" },
          { value: seconds, label: "sec" },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="w-14 rounded-lg bg-white/[0.06] px-2 py-2 text-center ring-1 ring-white/[0.07]"
            suppressHydrationWarning
          >
            <p className="font-semibold tabular-nums text-white">
              {value === null ? "--" : String(value).padStart(2, "0")}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-white/35">
              {label}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
