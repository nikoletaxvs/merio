import { redirect } from "next/navigation";

import { MerioMark } from "@/components/ui";
import { isDemoMode } from "@/lib/demo-mode";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  if (isDemoMode()) {
    redirect("/demo");
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <MerioMark className="h-10 w-10" />

          <h1 className="mt-5 font-display text-3xl font-medium">Merio</h1>

          <p className="mt-1.5 text-sm text-muted">
            Sign in to manage your subscription.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
