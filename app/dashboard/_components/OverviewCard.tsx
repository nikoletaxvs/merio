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
    <section className="mt-10 border-y border-border-strong">
      {/* A <dl> may only contain <dt>/<dd> pairs, so each column is its own
          list and the Edit button sits beside the last one, not inside it. */}
      <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <dl className="py-5 sm:px-5 sm:first:pl-0">
          <dt className="text-sm text-muted">
            Each member pays
          </dt>
          <dd className="mt-1.5">
            <Amount cents={amountCents} className="text-3xl font-medium tracking-tight" />
          </dd>
        </dl>

        <dl className="py-5 sm:px-5 sm:first:pl-0">
          <dt className="text-sm text-muted">
            Current period
          </dt>
          <dd className="mt-1.5 text-lg font-medium tabular-nums">{formatPeriod(periodStart, periodEnd)}</dd>
        </dl>

        <div className="flex items-start justify-between gap-2 py-5 sm:px-5 sm:pr-0">
          <dl>
            <dt className="text-sm text-muted">
              Payments created on
            </dt>
            <dd className="mt-1.5 text-lg font-medium tabular-nums">Day {generationDay}</dd>
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
          className="grid gap-4 border-t border-border py-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
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
