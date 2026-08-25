"use client";

import { useState, useTransition } from "react";
import { Badge, FormError, Input, Label } from "@/components/ui";
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

const AVATAR_STYLES = [
  "bg-violet-500/15 text-violet-300 ring-violet-400/20",
  "bg-sky-500/15 text-sky-300 ring-sky-400/20",
  "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
  "bg-amber-500/15 text-amber-300 ring-amber-400/20",
  "bg-rose-500/15 text-rose-300 ring-rose-400/20",
];

function hash(value: string) {
  return [...value].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

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
    runAction(() => deleteAction(member.id));
  }

  function handleRemind() {
    runAction(() => remindAction(member.id));
  }

  function handleUpdate(formData: FormData) {
    runAction(async () => {
      const result = await updateAction(null, formData);

      if (!result?.error) {
        setEditing(false);
      }

      return result ?? {};
    });
  }

  return (
    <div className="group transition-colors hover:bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`member-actions-${member.id}`}
        className="flex w-full items-center justify-between gap-4 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:p-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1 ${
              AVATAR_STYLES[
                Math.abs(hash(member.user.name)) % AVATAR_STYLES.length
              ]
            }`}
          >
            {initials(member.user.name)}
          </span>

          <div className="min-w-0">
            <p className="truncate font-medium text-white">{member.user.name}</p>
            <p className="mt-0.5 truncate text-sm text-white/40">
              {member.user.email}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {current ? (
            <>
              <div className="text-right">
                <p className="font-semibold tabular-nums">
                  €{(current.amountCents / 100).toFixed(2)}
                </p>

                {history.length > 1 && (
                  <p className="mt-0.5 hidden text-xs text-white/35 sm:block">
                    +{history.length - 1} earlier{" "}
                    {history.length - 1 === 1 ? "period" : "periods"}
                  </p>
                )}
              </div>

              <Badge tone={isPaid ? "success" : "pending"}>
                {isPaid ? "Paid" : "Pending"}
              </Badge>
            </>
          ) : (
            <span className="text-sm text-white/35">No payment yet</span>
          )}

          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={`h-4 w-4 text-white/40 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <path
              d="M5 7.5 10 12.5 15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      <div
        id={`member-actions-${member.id}`}
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mx-4 mb-4 space-y-4 rounded-xl border border-white/[0.07] bg-white/[0.04] p-4 sm:ml-13 sm:mr-5">
            {actionError && <FormError>{actionError}</FormError>}

            {/* Current period actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {current && !isPaid ? (
                <p className="text-sm text-white/45">
                  {formatPeriod(current.periodStart, current.periodEnd)}
                  {unpaidCount > 1 && (
                    <span className="ml-2 text-xs text-warning">
                      {unpaidCount} unpaid
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-white/40">
                  {current
                    ? isPaid
                      ? "All settled — no actions needed."
                      : "No payment generated for this period yet."
                    : "No payment yet."}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2.5">
                <CopyPaymentLinkButton token={member.token} />

                {current && !isPaid && (
                  <SubmitRemindButton onClick={handleRemind} disabled={isPending} />
                )}

                <span
                  aria-hidden="true"
                  className="mx-1 hidden h-4 w-px bg-white/10 sm:block"
                />

                <PillButton onClick={() => setEditing((value) => !value)}>
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3 w-3">
                    {editing ? (
                      <path
                        d="m5 5 10 10M15 5 5 15"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    ) : (
                      <path
                        d="M12.8 3.7l3.5 3.5L6.5 17H3v-3.5l9.8-9.8Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                  {editing ? "Close" : "Edit"}
                </PillButton>

                {confirmingDelete ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={isPending}
                      className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/60 transition hover:text-white disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 rounded-full bg-red-500/90 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500 active:scale-[0.99] disabled:opacity-50"
                    >
                      {isPending ? "Removing…" : "Yes, remove"}
                    </button>
                  </>
                ) : (
                  <PillButton onClick={() => setConfirmingDelete(true)}>
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3 w-3">
                      <path
                        d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6m2.5 0-.7 9.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5.5 6"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Remove
                  </PillButton>
                )}
              </div>
            </div>

            {/* Edit form */}
            {editing && (
              <form
                action={handleUpdate}
                className="grid gap-3 rounded-lg border border-white/[0.07] bg-black/20 p-4 sm:grid-cols-2"
              >
                <input type="hidden" name="memberId" value={member.id} />

                <div>
                  <Label htmlFor={`name-${member.id}`}>
                    Name
                  </Label>

                  <Input
                    id={`name-${member.id}`}
                    name="name"
                    required
                    defaultValue={member.user.name}
                  />
                </div>

                <div>
                  <Label htmlFor={`email-${member.id}`}>
                    Email
                  </Label>

                  <Input
                    id={`email-${member.id}`}
                    name="email"
                    type="email"
                    required
                    defaultValue={member.user.email}
                  />
                </div>

                <div className="flex items-center gap-2.5 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-brand-hover active:scale-[0.99] disabled:opacity-50"
                  >
                    {isPending ? "Saving…" : "Save changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/50 transition hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Payment history */}
            {history.length > 0 && (
              <div>
                {history.length > 1 && (
                  <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/30">
                    All payments
                  </p>
                )}

                <ul className="divide-y divide-white/[0.06]">
                  {history.map((payment) => {
                    const paymentPaid = payment.status === "paid";

                    return (
                      <li
                        key={payment.id}
                        className="flex items-center justify-between gap-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white/70">
                            {formatPeriod(
                              payment.periodStart,
                              payment.periodEnd,
                            )}
                          </p>

                          {payment.paidAt && (
                            <p className="mt-0.5 text-xs text-white/30">
                              Paid {formatDateLong(payment.paidAt)}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <p className="text-sm font-medium tabular-nums text-white/80">
                            €{(payment.amountCents / 100).toFixed(2)}
                          </p>

                          <Badge tone={paymentPaid ? "success" : "pending"}>
                            {paymentPaid ? "Paid" : "Pending"}
                          </Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitRemindButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.1] active:scale-[0.99] disabled:opacity-50"
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3 w-3">
        <path
          d="M10 3a4.5 4.5 0 0 0-4.5 4.5c0 3.6-1.5 5-1.5 5h12s-1.5-1.4-1.5-5A4.5 4.5 0 0 0 10 3Zm-1.8 12a2 2 0 0 0 3.6 0"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Send reminder
    </button>
  );
}

function PillButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.1] active:scale-[0.99]"
    >
      {children}
    </button>
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
