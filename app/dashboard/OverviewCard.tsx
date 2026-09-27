"use client";

import { useActionState, useState } from "react";
import { Card, FormError, Input, Label } from "@/components/ui";
import { Icon } from "@/components/icon";
import { formatPeriod } from "@/lib/periods";

export default function OverviewCard({
  amountCents,
  generationDay,
  periodStart,
  periodEnd,
  startDate,
  saveAction,
}: {
  amountCents: number;
  generationDay: number;
  periodStart: string;
  periodEnd: string;
  startDate: string;
  saveAction: (
    prev: { error: string } | null,
    formData: FormData,
  ) => Promise<{ error: string } | null>;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(saveAction, null);

  return (
    <Card className="mt-8 overflow-hidden border-white/10 bg-white/[0.04] p-0 shadow-none">
      <div className="grid divide-y divide-white/[0.08] sm:grid-cols-[1.2fr_1fr_1.2fr] sm:divide-x sm:divide-y-0">
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-1.5">
            <EuroIcon />
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/40">
              Monthly amount
            </p>
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-brand">
            €{(amountCents / 100).toFixed(2)}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-1.5">
            <RefreshIcon />
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/40">
              Generated
            </p>
          </div>
          <p className="mt-2 font-semibold">Day {generationDay}</p>
        </div>

        <div className="flex items-start justify-between gap-2 p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-1.5">
              <CalendarIcon />
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/40">
                Billing period
              </p>
            </div>
            <p className="mt-2 font-semibold">
              {formatPeriod(periodStart, periodEnd)}
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Edit billing period"
              className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {editing && (
        <form
          action={formAction}
          className="grid gap-4 border-t border-white/[0.08] bg-black/20 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6"
        >
          <div>
            <Label htmlFor="startDate" className="text-xs text-white/60">
              Period start date
            </Label>

            <Input
              id="startDate"
              name="startDate"
              type="date"
              required
              defaultValue={startDate}
              className="[color-scheme:dark]"
            />
          </div>

          <div>
            <Label htmlFor="generationDay" className="text-xs text-white/60">
              Generation day (1–28)
            </Label>

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

          <div className="flex items-center gap-2.5">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-brand px-4 py-2 text-xs font-semibold text-black transition hover:bg-brand-hover active:scale-[0.99] disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save"}
            </button>

            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full px-3 py-2 text-xs font-semibold text-white/50 transition hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}

function EuroIcon() {
  return (
    <Icon name="euro" className="h-3.5 w-3.5 text-brand" />
  );
}

function RefreshIcon() {
  return (
    <Icon name="refresh" className="h-3.5 w-3.5 text-brand" />
  );
}

function CalendarIcon() {
  return (
    <Icon name="calendar" className="h-3.5 w-3.5 text-brand" />
  );
}
