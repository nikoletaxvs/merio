"use client";

import { useActionState, useState } from "react";
import { Amount, Button, FormError, Input, Label } from "@/components/ui";
import { formatPeriod } from "@/lib/billing/periods";
import { updateBillingPeriod } from "../_actions/subscription";

export default function OverviewCard({
  amountCents,
  generationDay,
  periodStart,
  periodEnd,
  startDate,
}: {
  amountCents: number;
  generationDay: number;
  periodStart: string;
  periodEnd: string;
  startDate: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(updateBillingPeriod, null);

  return (
    <section className="mt-10 rounded-md border border-border bg-surface">
      {/* A <dl> may only contain <dt>/<dd> pairs, so each column is its own
          list and the Edit button sits beside the last one, not inside it. */}
      <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <dl className="p-5">
          <dt className="text-xs uppercase tracking-wider text-muted">
            Each member pays
          </dt>
          <dd className="mt-1.5">
            <Amount cents={amountCents} className="text-2xl font-medium" />
          </dd>
        </dl>

        <dl className="p-5">
          <dt className="text-xs uppercase tracking-wider text-muted">
            Current period
          </dt>
          <dd className="mt-2 font-mono">{formatPeriod(periodStart, periodEnd)}</dd>
        </dl>

        <div className="flex items-start justify-between gap-2 p-5">
          <dl>
            <dt className="text-xs uppercase tracking-wider text-muted">
              Payments created on
            </dt>
            <dd className="mt-2 font-mono">day {generationDay}</dd>
          </dl>

          {!editing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              aria-label="Edit billing period"
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {editing && (
        <form
          action={formAction}
          className="grid gap-4 border-t border-border p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <div>
            <Label htmlFor="startDate">Period start date</Label>

            <Input
              id="startDate"
              name="startDate"
              type="date"
              required
              defaultValue={startDate}
            />
          </div>

          <div>
            <Label htmlFor="generationDay">Generation day (1–28)</Label>

            <Input
              id="generationDay"
              name="generationDay"
              type="number"
              min={1}
              max={28}
              required
              defaultValue={generationDay}
            />
          </div>

          {state?.error && (
            <div className="sm:col-span-3">
              <FormError>{state.error}</FormError>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>

            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
