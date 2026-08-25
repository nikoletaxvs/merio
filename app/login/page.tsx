"use client";

import { useActionState } from "react";
import { Button, Input, Label, MerioMark } from "@/components/ui";
import { login, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    null,
  );

  return (
    <main className="page-glow flex min-h-screen w-full items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-brand/25">
            <MerioMark className="h-8 w-8 text-black" />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight">Merio</h1>

          <p className="mt-1.5 text-sm text-white/45">
            Sign in to manage your subscription.
          </p>
        </div>

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
      </div>
    </main>
  );
}
