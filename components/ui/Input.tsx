import type { ComponentProps } from "react";

/** Exported for native inputs that can't use <Input>, e.g. datetime-local. */
export const inputClasses =
  "mt-1.5 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-foreground focus:ring-2 focus:ring-foreground/10";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${inputClasses} ${className}`} {...props} />;
}
