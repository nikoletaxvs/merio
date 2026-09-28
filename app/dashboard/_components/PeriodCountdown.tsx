"use client";

import { useEffect, useState } from "react";
import { formatDateLong } from "@/lib/billing/periods";

export default function PeriodCountdown({
  generationDay,
}: {
  generationDay: number;
}) {
  const now = useNow();

  return (
    <div className="mt-3 flex flex-col justify-between gap-3 px-1 text-sm sm:flex-row sm:items-center">
      <p className="text-muted">
        Next payments are created on{" "}
        <span className="font-mono text-foreground">
          {formatDateLong(nextGenerationDate(generationDay))}
        </span>
      </p>

      <Countdown target={nextGenerationDate(generationDay).getTime()} now={now} />
    </div>
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

function Countdown({ target, now }: { target: number; now: number | null }) {
  const diff = now === null ? null : Math.max(0, target - now);

  const parts =
    diff === null
      ? null
      : [
          [Math.floor(diff / 86400000), "d"],
          [Math.floor((diff % 86400000) / 3600000), "h"],
          [Math.floor((diff % 3600000) / 60000), "m"],
          [Math.floor((diff % 60000) / 1000), "s"],
        ];

  return (
    // Hidden from screen readers: it changes every second, and the date
    // beside it already says when the next payments are created.
    <p
      aria-hidden="true"
      className="font-mono tabular-nums text-muted"
      suppressHydrationWarning
    >
      {parts === null
        ? "--d --h --m --s"
        : parts
            .map(([value, unit]) => `${String(value).padStart(2, "0")}${unit}`)
            .join(" ")}
    </p>
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
