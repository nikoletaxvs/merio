import type { ComponentProps } from "react";
import { type ButtonStyle, buttonClasses } from "./buttonStyles";

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
