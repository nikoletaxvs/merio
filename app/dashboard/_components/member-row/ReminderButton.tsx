"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Icon } from "@/components/ui";
import { remindMember } from "../../_actions/members";

export default function ReminderButton({
  memberId,
  memberName,
  onError,
}: {
  memberId: number;
  memberName: string;
  /** Shows a failure in the row's shared error area (null clears it). */
  onError: (message: string | null) => void;
}) {
  const [isSending, startSending] = useTransition();
  const [justSent, setJustSent] = useState(false);

  function send() {
    onError(null);

    startSending(async () => {
      try {
        const result = await remindMember(memberId);

        if (result.error) {
          onError(result.error);
        } else {
          setJustSent(true);
        }
      } catch {
        onError("Couldn't reach the server. No reminder was sent.");
      }
    });
  }

  // Show "Reminder sent" for 3 seconds. The cleanup clears the timer if the
  // row unmounts first (e.g. the member is removed), so it never fires late.
  useEffect(() => {
    if (!justSent) {
      return;
    }

    const timer = setTimeout(() => setJustSent(false), 3000);

    return () => clearTimeout(timer);
  }, [justSent]);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={send}
        disabled={isSending || justSent}
      >
        <Icon name={justSent ? "check" : "bell"} className="h-3 w-3" />
        {isSending ? "Sending…" : justSent ? "Reminder sent" : "Send reminder"}
      </Button>

      {/* Announces the result to screen readers, which don't see the label change. */}
      <span className="sr-only" aria-live="polite">
        {justSent ? `Reminder sent to ${memberName}` : ""}
      </span>
    </>
  );
}
