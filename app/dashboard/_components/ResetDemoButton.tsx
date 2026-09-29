"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

/**
 * Submit button for the demo reset form. useFormStatus reads the pending state
 * of the <form> it sits in, so the banner around it can stay a server
 * component.
 */
export default function ResetDemoButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" size="sm" disabled={pending}>
      {pending ? "Resetting…" : "Reset data"}
    </Button>
  );
}
