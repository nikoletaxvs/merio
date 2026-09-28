"use client";

import { useActionState } from "react";
import { Button, FormError, Input, Label } from "@/components/ui";
import { updateFamilySettings } from "../_actions/subscription";

export default function FamilySettingsForm({
  familyName,
  photoUrl,
}: {
  familyName: string;
  photoUrl: string;
}) {
  const [state, formAction, isPending] = useActionState(updateFamilySettings, null);

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
