import Link from "next/link";
import type { ComponentProps } from "react";

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

type ButtonStyle = {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

function buttonClasses({ variant = "primary", size = "md" }: ButtonStyle, extra = "") {
  return `${buttonBase} ${buttonSizes[size]} ${buttonVariants[variant]} ${extra}`;
}

/** An action. Defaults to type="button" so it never submits a form by accident. */
export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonStyle & ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size }, className)}
      {...props}
    />
  );
}

/**
 * Navigation styled as a button. A separate component rather than an `href`
 * prop on Button, so each one accepts exactly the props of the element it
 * renders (aria-label, prefetch, etc. are all typed and passed through).
 */
export function ButtonLink({
  variant,
  size,
  className,
  newTab = false,
  ...props
}: ButtonStyle & ComponentProps<typeof Link> & { newTab?: boolean }) {
  return (
    <Link
      className={buttonClasses({ variant, size }, className)}
      {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
      {...props}
    />
  );
}
