import type { ReactNode } from "react";

/** One headed section of the privacy page. */
export default function PolicySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-medium">{title}</h2>
      <div className="mt-3 leading-7 text-muted">{children}</div>
    </section>
  );
}
