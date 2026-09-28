import type { ComponentProps, ReactNode } from "react";

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

/** Exported for native inputs that can't use <Input>, e.g. datetime-local. */
export const inputClasses =
  "mt-1.5 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-foreground focus:ring-2 focus:ring-foreground/10";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${inputClasses} ${className}`} {...props} />;
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
