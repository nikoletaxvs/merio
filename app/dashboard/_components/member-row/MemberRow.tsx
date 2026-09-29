"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Button, ButtonLink, FormError, Icon } from "@/components/ui";
import { formatPeriod } from "@/lib/billing/periods";
import { deleteMember } from "../../_actions/members";
import CopyPaymentLinkButton from "./CopyPaymentLink";
import EditMemberForm from "./EditMemberForm";
import MemberSummary from "./MemberSummary";
import PaymentHistory from "./PaymentHistory";
import ReminderButton from "./ReminderButton";
import RemoveMemberButton from "./RemoveMemberButton";
import type { MemberRowData } from "./types";

export default function MemberRow({
  member,
  currentPeriodStart,
}: {
  member: MemberRowData;
  currentPeriodStart: string;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, startRemoving] = useTransition();
  // Hides the row the moment removal is confirmed. If the delete fails, the
  // transition ends with the server still listing this member, so the
  // override is dropped and the row comes back with the error.
  const [removed, markRemoved] = useOptimistic(false, () => true);

  const history = [...member.payments].sort((a, b) =>
    b.periodStart.localeCompare(a.periodStart),
  );
  const current =
    history.find((p) => p.periodStart === currentPeriodStart) ?? null;
  const isPaid = current?.status === "paid";
  const unpaidCount = history.filter((p) => p.status !== "paid").length;

  function remove() {
    setError(null);

    startRemoving(async () => {
      markRemoved(null);

      try {
        const result = await deleteMember(member.id);

        if (result.error) {
          setError(result.error);
        }
      } catch {
        setError("Couldn't reach the server. The member wasn't removed.");
      }
    });
  }

  if (removed) {
    return null;
  }

  const panelId = `member-actions-${member.id}`;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-1 py-4 text-left transition-colors hover:bg-surface-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40"
      >
        <MemberSummary
          name={member.user.name}
          email={member.user.email}
          current={current}
          open={open}
        />
      </button>

      <div
        id={panelId}
        // Collapsed panels are only visually hidden (for the animation), so
        // `inert` takes their buttons out of the tab order and the
        // accessibility tree until the row is opened.
        inert={!open}
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mb-4 space-y-4 border-l-2 border-border-strong pl-4 sm:ml-12">
            {error && <FormError>{error}</FormError>}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                {current ? (
                  <>
                    <span className="tabular-nums">
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
                <ButtonLink
                  href={`/pay/${member.token}`}
                  newTab
                  variant="secondary"
                  size="sm"
                  aria-label={`Open ${member.user.name}'s pay page (opens in a new tab)`}
                >
                  <Icon name="external" className="h-3 w-3" />
                  Open pay page
                </ButtonLink>

                <CopyPaymentLinkButton token={member.token} />

                {current && !isPaid && (
                  <ReminderButton
                    memberId={member.id}
                    memberName={member.user.name}
                    onError={setError}
                  />
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing((value) => !value)}
                >
                  <Icon name={editing ? "close" : "pencil"} className="h-3 w-3" />
                  {editing ? "Close" : "Edit"}
                </Button>

                <RemoveMemberButton onConfirm={remove} pending={isRemoving} />
              </div>
            </div>

            {editing && (
              <EditMemberForm
                member={{
                  id: member.id,
                  name: member.user.name,
                  email: member.user.email,
                }}
                onDone={() => setEditing(false)}
              />
            )}

            {history.length > 0 && (
              <PaymentHistory memberName={member.user.name} payments={history} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
