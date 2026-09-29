import { Amount, Badge } from "@/components/ui";

// €19.99 split six ways, the way a real family plan looks.
const SAMPLE_ROWS = [
  { name: "Eleni", amountCents: 333, paid: true },
  { name: "Marco", amountCents: 333, paid: true },
  { name: "Jordan", amountCents: 333, paid: false },
  { name: "Priya", amountCents: 333, paid: true },
  { name: "Tomás", amountCents: 333, paid: false },
];

/** Static example of one month in Merio, used as the landing page visual. */
export default function SampleLedger() {
  return (
    // The rotated sheet behind gives the page a physical stack of paper
    // instead of a single flat card.
    <div className="relative md:translate-y-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-2 translate-y-2 rotate-2 rounded-md border border-border bg-surface-muted"
      />

      <figure
        aria-label="Example of a month in Merio"
        className="relative rounded-md border border-border bg-surface shadow-[0_18px_40px_-24px_rgb(60_45_20/0.35)]"
      >
        <figcaption className="flex items-baseline justify-between border-b border-border px-5 py-3.5">
          <span className="font-display text-lg font-medium">Spotify Family</span>
          <span className="text-xs tabular-nums text-muted">15 Mar – 15 Apr</span>
        </figcaption>

        <ul className="divide-y divide-border">
          {SAMPLE_ROWS.map((row) => (
            <li
              key={row.name}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span>{row.name}</span>
              <span className="flex items-center gap-5">
                <Amount cents={row.amountCents} />
                <Badge tone={row.paid ? "success" : "pending"} className="w-12">
                  {row.paid ? "Paid" : "Owes"}
                </Badge>
              </span>
            </li>
          ))}
        </ul>

        <p className="border-t border-border px-5 py-3 text-xs text-muted">
          Reminders sent to Jordan and Tomás on 22 Mar
        </p>
      </figure>
    </div>
  );
}
