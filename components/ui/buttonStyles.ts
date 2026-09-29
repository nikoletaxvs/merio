// Shared by Button and ButtonLink so an action and a link styled as a button
// always look identical.

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

export type ButtonStyle = {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export function buttonClasses(
  { variant = "primary", size = "md" }: ButtonStyle,
  extra = "",
) {
  return `${buttonBase} ${buttonSizes[size]} ${buttonVariants[variant]} ${extra}`;
}
