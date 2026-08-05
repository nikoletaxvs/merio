import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function SpotifyMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="12" cy="12" r="12" className="fill-brand" />
      <g
        stroke="black"
        strokeWidth="1.7"
        strokeLinecap="round"
        className="opacity-90"
      >
        <path d="M6.6 16.6c3.6-1.5 7.9-1.2 10.8 1" />
        <path d="M7.8 13.3c3-1.2 6.6-1 9 .8" />
        <path d="M9.3 9.9c2.3-.9 5.1-.6 7 .7" />
      </g>
    </svg>
  );
}

const buttonVariants = {
  primary:
    "bg-brand text-black hover:bg-brand-hover active:bg-brand",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-surface-muted",
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50";

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  ...props
}: {
  children: ReactNode;
  href?: string;
  variant?: keyof typeof buttonVariants;
} & ComponentProps<"button">) {
  const classes = `${buttonBase} ${buttonVariants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

const badgeTones = {
  neutral: "bg-surface-muted text-muted",
  success: "bg-brand-soft text-brand",
  pending: "bg-warning-soft text-warning",
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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
