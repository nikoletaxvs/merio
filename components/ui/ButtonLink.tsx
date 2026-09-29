import Link from "next/link";
import type { ComponentProps } from "react";
import { type ButtonStyle, buttonClasses } from "./buttonStyles";

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
