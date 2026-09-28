import type { ReactNode } from "react";

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
