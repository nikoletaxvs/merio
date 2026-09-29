"use client";

import { useActionState } from "react";
import { Button, FormError, Input, Label } from "@/components/ui";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    null,
  );

  return (
    <form
      action={formAction}
      className="mt-8 border-t border-border pt-6"
    >
      <div>
        <Label htmlFor="password">
          Owner password
        </Label>

        <Input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <div className="mt-3">
          <FormError>{state.error}</FormError>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="mt-5 w-full">
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
