"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui";
import { formatPeriod } from "@/lib/periods";
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
  remindAction: (memberId: number) => Promise<void>;
  updateAction: (
    memberId: number,
    formData: FormData,
  ) => Promise<void>;
  deleteAction: (memberId: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const history = [...member.payments].sort(
    (a, b) => b.periodStart.localeCompare(a.periodStart),
  );
  const current =
    history.find((p) => p.periodStart === currentPeriodStart) ?? null;

  const isPaid = current?.status === "paid";
  const unpaidCount = history.filter((p) => p.status !== "paid").length;

  function handleDelete() {
    startTransition(async () => {
      await deleteAction(member.id);
    });
  }

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      await updateAction(member.id, formData);
      setEditing(false);
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
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand ring-1 ring-brand/10">
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
                  <form action={remindAction.bind(null, member.id)}>
                    <SubmitRemindButton />
                  </form>
                )}

                <span
                  aria-hidden="true"
                  className="mx-1 hidden h-4 w-px bg-white/10 sm:block"
                />

                <PillButton onClick={() => setEditing((value) => !value)}>
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
                <div>
                  <label
                    htmlFor={`name-${member.id}`}
                    className="block text-xs font-medium text-white/60"
                  >
                    Name
                  </label>

                  <input
                    id={`name-${member.id}`}
                    name="name"
                    required
                    defaultValue={member.user.name}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/60 focus:ring-2 focus:ring-brand/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`email-${member.id}`}
                    className="block text-xs font-medium text-white/60"
                  >
                    Email
                  </label>

                  <input
                    id={`email-${member.id}`}
                    name="email"
                    type="email"
                    required
                    defaultValue={member.user.email}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-brand/60 focus:ring-2 focus:ring-brand/10"
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
                              Paid{" "}
                              {payment.paidAt.toLocaleDateString(undefined, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
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

function SubmitRemindButton() {
  return (
    <button
      type="submit"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.1] active:scale-[0.99]"
    >
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
