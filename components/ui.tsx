import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function MerioMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <rect width="24" height="24" rx="4" className="fill-foreground" />
      <path
        d="M6.5 16.5v-9l5.5 9 5.5-9v9"
        className="stroke-background"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

const buttonVariants = {
  primary: "bg-foreground text-background hover:bg-foreground/85",
  secondary:
    "border border-border-strong bg-surface text-foreground hover:bg-surface-muted",
  ghost: "text-muted hover:bg-surface-muted hover:text-foreground",
  danger: "bg-danger text-surface hover:bg-danger/85",
};

const buttonSizes = {
  md: "gap-2 px-4 py-2 text-sm",
  sm: "gap-1.5 px-2.5 py-1 text-xs",
};

const buttonBase =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

export function Button({
  children,
  href,
  newTab = false,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: {
  children: ReactNode;
  href?: string;
  /** Only applies with `href`. */
  newTab?: boolean;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
} & ComponentProps<"button">) {
  const classes = `${buttonBase} ${buttonSizes[size]} ${buttonVariants[variant]} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
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
    <div className={`rounded-md border border-border bg-surface p-6 ${className}`}>
      {children}
    </div>
  );
}

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

/** Euro amount from cents, set in mono so columns of money line up. */
export function Amount({
  cents,
  className = "",
}: {
  cents: number;
  className?: string;
}) {
  return (
    <span className={`font-mono tabular-nums ${className}`}>
      €{(cents / 100).toFixed(2)}
    </span>
  );
}

export function Label({
  children,
  htmlFor,
  className = "",
}: {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-foreground ${className}`}
    >
      {children}
    </label>
  );
}

export const inputClasses =
  "mt-1.5 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-foreground focus:ring-2 focus:ring-foreground/10";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${inputClasses} ${className}`} {...props} />;
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
      <div>
        <h2 className="font-display text-xl font-medium">{title}</h2>

        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>

      {action}
    </div>
  );
}

/** Placeholder block for loading states. Size it with className. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-sm bg-surface-muted ${className}`}
    />
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger"
    >
      {children}
    </p>
  );
}
