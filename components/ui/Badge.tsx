import type { ReactNode } from "react";

// Rubber-stamp style status label.
const badgeTones = {
  neutral: "border-border-strong text-muted",
  success: "border-accent/50 bg-accent-soft text-accent",
  pending: "border-pending/50 bg-pending-soft text-pending",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof badgeTones;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
