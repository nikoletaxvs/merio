import type { ReactNode } from "react";

// Status label: a coloured dot plus sentence-case text. The dot carries the
// colour, so the text stays readable and the row doesn't shout in capitals.
const badgeTones = {
  neutral: { text: "text-muted", dot: "bg-border-strong" },
  success: { text: "text-accent", dot: "bg-accent" },
  pending: { text: "text-pending", dot: "bg-pending" },
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
  const { text, dot } = badgeTones[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${text} ${className}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}
