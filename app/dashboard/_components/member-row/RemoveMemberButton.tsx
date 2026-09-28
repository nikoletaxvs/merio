"use client";

import { useState } from "react";
import { Button, Icon } from "@/components/ui";

/** "Remove", then an inline "Cancel / Yes, remove" confirmation. */
export default function RemoveMemberButton({
  onConfirm,
  pending,
}: {
  onConfirm: () => void;
  pending: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
        <Icon name="trash" className="h-3 w-3" />
        Remove
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(false)}
        disabled={pending}
      >
        Cancel
      </Button>

      <Button variant="danger" size="sm" onClick={onConfirm} disabled={pending}>
        {pending ? "Removing…" : "Yes, remove"}
      </Button>
    </>
  );
}
