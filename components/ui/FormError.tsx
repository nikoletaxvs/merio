import type { ReactNode } from "react";

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
