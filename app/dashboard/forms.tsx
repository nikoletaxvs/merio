"use client";

import { useActionState } from "react";
import { Button, FormError, Input, Label } from "@/components/ui";
import type { ActionState } from "./actions";

type FormAction = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function AddMemberForm({ action }: { action: FormAction }) {
  const [state, formAction, isPending] = useActionState(action, null);

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

export function FamilySettingsForm({
  action,
  familyName,
  photoUrl,
}: {
  action: FormAction;
  familyName: string;
  photoUrl: string;
}) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="grid gap-5">
      <div>
        <Label htmlFor="familyName">Family name</Label>

        <Input
          id="familyName"
          name="familyName"
          defaultValue={familyName}
          placeholder="e.g. The Smiths"
        />
      </div>

      <div>
        <Label htmlFor="photoUrl">Photo URL</Label>

        <Input
          id="photoUrl"
          name="photoUrl"
          defaultValue={photoUrl}
          placeholder="https://example.com/photo.jpg"
        />
      </div>

      {state?.error && <FormError>{state.error}</FormError>}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

export function ActivateAllButton({ action }: { action: FormAction }) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <form action={formAction}>
        <Button
          type="submit"
          variant="secondary"
          disabled={isPending}
          className="!px-4 !py-2 text-xs"
        >
          {isPending ? "Activating…" : "Activate all"}
        </Button>
      </form>

      {state?.error && (
        <p role="alert" className="text-xs text-red-300">
          {state.error}
        </p>
      )}
    </div>
  );
}
