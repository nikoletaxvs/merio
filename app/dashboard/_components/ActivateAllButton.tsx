"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { activateAllPayments } from "../_actions/billing";

/** Creates this period's payment for any member who doesn't have one yet. */
export default function ActivateAllButton() {
  const [state, formAction, isPending] = useActionState(activateAllPayments, null);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <form action={formAction}>
        <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
          {isPending ? "Activating…" : "Activate all"}
        </Button>
      </form>

      {state?.error && (
        <p role="alert" className="text-xs text-danger">
          {state.error}
        </p>
      )}
    </div>
  );
}
