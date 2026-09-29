"use client";

import { useEffect, useState } from "react";

/**
 * The current time in ms, updated every `intervalMs`. Starts as null so the
 * server render and the first client render match (no hydration mismatch);
 * the real time arrives right after mount.
 */
export function useNow(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());

    const timeout = setTimeout(tick, 0);
    const interval = setInterval(tick, intervalMs);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [intervalMs]);

  return now;
}
