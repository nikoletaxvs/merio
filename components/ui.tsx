import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function MerioMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect width="24" height="24" rx="6.5" className="fill-brand" />
      <path
        d="M6.5 16.5v-9l5.5 9 5.5-9v9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
