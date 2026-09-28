"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { Amount, Badge, Button, FormError, Input, Label } from "@/components/ui";
import { Icon } from "@/components/icon";
import { formatDateLong, formatPeriod } from "@/lib/periods";
import CopyPaymentLinkButton from "./CopyPaymentLink";

export type MemberPayment = {
  id: number;
  amountCents: number;
  periodStart: string;
  periodEnd: string;
  status: string;
  paidAt: Date | null;
};

export default function MemberRow({
  member,
  currentPeriodStart,
  remindAction,
  updateAction,
  deleteAction,
}: {
  member: {
    id: number;
    token: string;
    user: { name: string; email: string };
    payments: MemberPayment[];
  };
  currentPeriodStart: string;
  remindAction: (memberId: number) => Promise<{ error?: string }>;
  updateAction: (
    prev: { error: string } | null,
    formData: FormData,
  ) => Promise<{ error: string } | null>;
  deleteAction: (memberId: number) => Promise<{ error?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isReminding, startReminding] = useTransition();
  const [justReminded, setJustReminded] = useState(false);
  // Hides the row the moment removal is confirmed. If the delete fails, the
  // transition ends with the server still listing this member, so the
  // override is dropped and the row comes back with the error.
  const [removed, markRemoved] = useOptimistic(false, () => true);

  const history = [...member.payments].sort(
    (a, b) => b.periodStart.localeCompare(a.periodStart),
  );
  const current =
    history.find((p) => p.periodStart === currentPeriodStart) ?? null;

  const isPaid = current?.status === "paid";
  const unpaidCount = history.filter((p) => p.status !== "paid").length;

  function runAction(run: () => Promise<{ error?: string }>) {
    setActionError(null);

    startTransition(async () => {
      const result = await run();

      if (result.error) {
        setActionError(result.error);
      }
    });
  }

  function handleDelete() {
    setActionError(null);

    startTransition(async () => {
      markRemoved(null);

      try {
        const result = await deleteAction(member.id);

        if (result.error) {
          setActionError(result.error);
        }
      } catch {
        setActionError("Couldn't reach the server. The member wasn't removed.");
      }
    });
  }

  // Own transition so only this button shows "Sending…", not edit/remove too.
  function handleRemind() {
    setActionError(null);

    startReminding(async () => {
      try {
        const result = await remindAction(member.id);

        if (result.error) {
          setActionError(result.error);
        } else {
          setJustReminded(true);
        }
      } catch {
        setActionError("Couldn't reach the server. No reminder was sent.");
      }
    });
  }

  // Show "Sent" for 3 seconds. The cleanup clears the timer if the row
  // unmounts first (e.g. the member is removed), so it never fires late.
  useEffect(() => {
    if (!justReminded) {
      return;
    }

    const timer = setTimeout(() => setJustReminded(false), 3000);

    return () => clearTimeout(timer);
  }, [justReminded]);

  function handleUpdate(formData: FormData) {
    runAction(async () => {
      const result = await updateAction(null, formData);

      if (!result?.error) {
        setEditing(false);
      }

      return result ?? {};
    });
  }

  if (removed) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`member-actions-${member.id}`}
        className="flex w-full items-center justify-between gap-4 px-1 py-4 text-left transition-colors hover:bg-surface-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-strong font-mono text-xs font-medium text-muted">
            {initials(member.user.name)}
          </span>

          <div className="min-w-0">
            <p className="truncate font-medium">{member.user.name}</p>
            <p className="truncate text-sm text-muted">{member.user.email}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {current ? (
            <>
              <Amount cents={current.amountCents} className="hidden sm:inline" />

              <Badge tone={isPaid ? "success" : "pending"}>
                {isPaid ? "Paid" : "Owes"}
              </Badge>
            </>
          ) : (
            <span className="text-sm text-muted">No payment yet</span>
          )}

          <Icon
            name="chevronDown"
            className={`h-4 w-4 text-muted transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        id={`member-actions-${member.id}`}
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mb-4 space-y-4 border-l-2 border-border-strong pl-4 sm:ml-12">
            {actionError && <FormError>{actionError}</FormError>}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                {current ? (
                  <>
                    <span className="font-mono">
                      {formatPeriod(current.periodStart, current.periodEnd)}
                    </span>
                    {isPaid && " · settled"}
                    {!isPaid && unpaidCount > 1 && (
                      <span className="ml-2 text-pending">
                        {unpaidCount} months unpaid
                      </span>
                    )}
                  </>
                ) : (
                  "No payment for this period yet."
                )}
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  href={`/pay/${member.token}`}
                  newTab
                  variant="secondary"
                  size="sm"
                >
                  <Icon name="external" className="h-3 w-3" />
                  Open pay page
                  <span className="sr-only"> (opens in a new tab)</span>
                </Button>

                <CopyPaymentLinkButton token={member.token} />

                {current && !isPaid && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRemind}
                    disabled={isReminding || justReminded}
                  >
                    <Icon
                      name={justReminded ? "check" : "bell"}
                      className="h-3 w-3"
                    />
                    {isReminding
                      ? "Sending…"
                      : justReminded
                        ? "Reminder sent"
                        : "Send reminder"}
                  </Button>
                )}

                {/* Announces the result to screen readers, which don't see the label change. */}
                <span className="sr-only" aria-live="polite">
                  {justReminded ? `Reminder sent to ${member.user.name}` : ""}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing((value) => !value)}
                >
                  <Icon name={editing ? "close" : "pencil"} className="h-3 w-3" />
                  {editing ? "Close" : "Edit"}
                </Button>

                {confirmingDelete ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isPending}
                    >
                      {isPending ? "Removing…" : "Yes, remove"}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmingDelete(true)}
                  >
                    <Icon name="trash" className="h-3 w-3" />
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {editing && (
              <form
                action={handleUpdate}
                className="grid gap-3 rounded-md border border-border bg-surface p-4 sm:grid-cols-2"
              >
                <input type="hidden" name="memberId" value={member.id} />

                <div>
                  <Label htmlFor={`name-${member.id}`}>Name</Label>

                  <Input
                    id={`name-${member.id}`}
                    name="name"
                    required
                    defaultValue={member.user.name}
                  />
                </div>

                <div>
                  <Label htmlFor={`email-${member.id}`}>Email</Label>

                  <Input
                    id={`email-${member.id}`}
                    name="email"
                    type="email"
                    required
                    defaultValue={member.user.email}
                  />
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? "Saving…" : "Save changes"}
                  </Button>

                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {history.length > 0 && (
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Payment history for {member.user.name}
                </caption>
                <tbody className="divide-y divide-border">
                  {history.map((payment) => {
                    const paymentPaid = payment.status === "paid";

                    return (
                      <tr key={payment.id}>
                        <td className="py-2 pr-3 font-mono text-muted">
                          {formatPeriod(payment.periodStart, payment.periodEnd)}
                        </td>
                        <td className="hidden py-2 pr-3 text-muted sm:table-cell">
                          {payment.paidAt
                            ? `Paid ${formatDateLong(payment.paidAt)}`
                            : ""}
                        </td>
                        <td className="py-2 pr-3 text-right">
                          <Amount cents={payment.amountCents} />
                        </td>
                        <td className="w-0 py-2 text-right">
                          <Badge tone={paymentPaid ? "success" : "pending"}>
                            {paymentPaid ? "Paid" : "Owed"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
