"use client";

import { useActionState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    null,
  );

  return (
    <form
      action={formAction}
      className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg shadow-black/30"
    >
      <div>
        <Label htmlFor="password" className="text-xs text-white/60">
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
        <p
          role="alert"
          className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 ring-1 ring-red-500/20"
        >
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="mt-5 w-full">
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
