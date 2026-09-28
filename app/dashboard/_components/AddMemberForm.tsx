"use client";

import { useActionState } from "react";
import { Button, FormError, Input, Label } from "@/components/ui";
import { addMember } from "../_actions/members";

export default function AddMemberForm() {
  const [state, formAction, isPending] = useActionState(addMember, null);

  return (
    <form action={formAction} className="grid gap-5">
      <div>
        <Label htmlFor="name">Name</Label>

        <Input id="name" name="name" required placeholder="George" />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>

        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="george@example.com"
        />
      </div>

      {state?.error && <FormError>{state.error}</FormError>}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Adding…" : "Add member"}
      </Button>
    </form>
  );
}
