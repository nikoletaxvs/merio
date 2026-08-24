"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { formatDateLong } from "@/lib/periods";

export default function PeriodCountdown({
  generationDay,
}: {
  generationDay: number;
}) {
  const now = useNow();

  return (
    <Card className="mt-4 flex flex-col justify-between gap-5 border-white/10 bg-white/[0.04] shadow-none sm:flex-row sm:items-center">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          Next payment generation
        </p>

        <p className="mt-1.5 text-sm leading-6 text-white/40">
          Day {generationDay} of each month —{" "}
          <span className="font-medium text-white/70">
            {formatDateLong(nextGenerationDate(generationDay))}
          </span>
        </p>
      </div>

      <TimeBoxes target={nextGenerationDate(generationDay).getTime()} now={now} />
    </Card>
  );
}

function useNow() {
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

  return now;
}

function TimeBoxes({
  target,
  now,
}: {
  target: number;
  now: number | null;
}) {
  const diff = now === null ? null : Math.max(0, target - now);

  const days = diff === null ? null : Math.floor(diff / 86400000);
  const hours = diff === null ? null : Math.floor((diff % 86400000) / 3600000);
  const minutes = diff === null ? null : Math.floor((diff % 3600000) / 60000);
  const seconds = diff === null ? null : Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex shrink-0 items-center gap-2">
      {[
        { value: days, label: "days", accent: false },
        { value: hours, label: "hrs", accent: false },
        { value: minutes, label: "min", accent: false },
        { value: seconds, label: "sec", accent: true },
      ].map(({ value, label, accent }) => (
        <div
          key={label}
          className={`w-14 rounded-xl px-2 py-2.5 text-center ring-1 transition-colors ${
            accent
              ? "bg-brand/10 ring-brand/25"
              : "bg-black/40 ring-white/[0.08]"
          }`}
          suppressHydrationWarning
        >
          <p
            className={`text-lg font-bold tabular-nums ${
              accent ? "text-brand" : "text-white"
            }`}
          >
            {value === null ? "--" : String(value).padStart(2, "0")}
          </p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-white/35">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

function nextGenerationDate(generationDay: number, today: Date = new Date()) {
  const candidate = new Date(
    today.getFullYear(),
    today.getMonth(),
    generationDay,
  );

  if (candidate.getTime() <= today.getTime()) {
    candidate.setMonth(candidate.getMonth() + 1);
  }

  return candidate;
}
