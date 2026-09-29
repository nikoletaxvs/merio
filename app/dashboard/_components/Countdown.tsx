"use client";

import { useNow } from "@/hooks/useNow";

/** Live "12d 04h 30m 09s" until `target` (ms since epoch). */
export default function Countdown({ target }: { target: number }) {
  const now = useNow();
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
