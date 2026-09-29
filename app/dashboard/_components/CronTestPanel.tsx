"use client";

import { useActionState, useState } from "react";
import { Button, FormError, inputClasses } from "@/components/ui";
import { testCronReminders } from "../_actions/billing";

/** Runs the reminder job for chosen members as if it were another date. */
export default function CronTestPanel({
  members,
}: {
  members: { id: number; name: string; email: string }[];
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [simTimestamp, setSimTimestamp] = useState("");
  const [state, formAction, isPending] = useActionState(testCronReminders, null);

  function toggle(id: number, checked: boolean) {
    setSelected((previous) => {
      const next = new Set(previous);

      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setSelected(
      checked ? new Set(members.map((member) => member.id)) : new Set(),
    );
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted">Add members first to run a cron test.</p>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="overflow-hidden rounded-md border border-border">
        <label className="flex cursor-pointer items-center gap-3 border-b border-border bg-surface-muted/60 px-3.5 py-2">
          <input
            type="checkbox"
            checked={selected.size === members.length}
            onChange={(event) => toggleAll(event.target.checked)}
            className="h-4 w-4 shrink-0 accent-foreground"
          />

          <span className="text-xs font-medium text-muted">
            Select all members
          </span>
        </label>

        <div className="divide-y divide-border">
          {members.map((member) => (
            <label
              key={member.id}
              className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-surface-muted/60"
            >
              <input
                type="checkbox"
                checked={selected.has(member.id)}
                onChange={(event) => toggle(member.id, event.target.checked)}
                className="h-4 w-4 shrink-0 accent-foreground"
              />

              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {member.name}
                </span>
                <span className="block truncate text-xs text-muted">
                  {member.email}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {state?.error && <FormError>{state.error}</FormError>}

      {state?.sent !== undefined && (
        <p
          role="status"
          className="rounded-md border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent"
        >
          {state.sent} notification
          {state.sent === 1 ? "" : "s"} sent.
          {state.created
            ? ` ${state.created} payment${state.created === 1 ? "" : "s"} generated.`
            : ""}
          {state.skipped ? ` ${state.skipped} skipped (already paid).` : ""}
          {state.notDue
            ? ` ${state.notDue} not due for a notification on this date.`
            : ""}
        </p>
      )}

      <label>
        <span className="block text-sm font-medium">Simulate cron time</span>

        <input
          type="datetime-local"
          step="1"
          value={simTimestamp}
          onChange={(event) => setSimTimestamp(event.target.value)}
          className={inputClasses}
        />

        <span className="mt-1 block text-xs text-muted">
          Run the cron as if it were this date and time (down to the second).
          Leave empty to use now.
        </span>
      </label>

      <form action={formAction} className="mt-1">
        {[...selected].map((id) => (
          <input key={id} type="hidden" name="memberIds" value={id} />
        ))}

        {simTimestamp && (
          <input type="hidden" name="simTimestamp" value={simTimestamp} />
        )}

        <Button
          type="submit"
          disabled={isPending || selected.size === 0}
          className="w-full sm:w-auto"
        >
          {isPending
            ? "Running…"
            : `Run cron for ${selected.size} ${selected.size === 1 ? "member" : "members"}`}
        </Button>
      </form>
    </div>
  );
}
