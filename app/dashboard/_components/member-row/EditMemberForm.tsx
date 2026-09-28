"use client";

import { useState, useTransition } from "react";
import { Button, FormError, Input, Label } from "@/components/ui";
import { updateMember } from "../../_actions/members";

export default function EditMemberForm({
  member,
  onDone,
}: {
  member: { id: number; name: string; email: string };
  onDone: () => void;
}) {
  const [isSaving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save(formData: FormData) {
    setError(null);

    startSaving(async () => {
      const result = await updateMember(null, formData);

      if (result?.error) {
        setError(result.error);
      } else {
        onDone();
      }
    });
  }

  return (
    <form
      action={save}
      className="grid gap-3 rounded-md border border-border bg-surface p-4 sm:grid-cols-2"
    >
      <input type="hidden" name="memberId" value={member.id} />

      <div>
        <Label htmlFor={`name-${member.id}`}>Name</Label>
        <Input
          id={`name-${member.id}`}
          name="name"
          required
          defaultValue={member.name}
        />
      </div>

      <div>
        <Label htmlFor={`email-${member.id}`}>Email</Label>
        <Input
          id={`email-${member.id}`}
          name="email"
          type="email"
          required
          defaultValue={member.email}
        />
      </div>

      {error && (
        <div className="sm:col-span-2">
          <FormError>{error}</FormError>
        </div>
      )}

      <div className="flex items-center gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save changes"}
        </Button>

        <Button variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
