import { Amount, Badge } from "@/components/ui";

const SAMPLE_ROWS = [
  { name: "Alex", amountCents: 300, paid: true },
  { name: "Sam", amountCents: 300, paid: true },
  { name: "Jordan", amountCents: 300, paid: false },
  { name: "Maya", amountCents: 300, paid: true },
];

/** Static example of one month in Merio, used as the landing page visual. */
export default function SampleLedger() {
  return (
    <figure
      aria-label="Example of a month in Merio"
      className="rounded-md border border-border bg-surface"
    >
      <figcaption className="flex items-baseline justify-between border-b border-border px-5 py-3">
        <span className="font-display text-lg font-medium">Spotify Family</span>
        <span className="font-mono text-xs text-muted">15 Mar – 15 Apr</span>
      </figcaption>

      <ul className="divide-y divide-border">
        {SAMPLE_ROWS.map((row) => (
          <li
            key={row.name}
            className="flex items-center justify-between px-5 py-3 text-sm"
          >
            <span>{row.name}</span>
            <span className="flex items-center gap-4">
              <Amount cents={row.amountCents} />
              <Badge tone={row.paid ? "success" : "pending"}>
                {row.paid ? "Paid" : "Owes"}
              </Badge>
            </span>
          </li>
        ))}
      </ul>

      <p className="border-t border-border px-5 py-3 font-mono text-xs text-muted">
        Reminder to Jordan sent 22 Mar
      </p>
    </figure>
  );
}
