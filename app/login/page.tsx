import { redirect } from "next/navigation";

import { MerioMark } from "@/components/ui";
import { isDemoMode } from "@/lib/demo-mode";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  if (isDemoMode()) {
    redirect("/demo");
  }

  return (
    <main className="flex min-h-dvh w-full items-center px-6 pb-[12vh]">
      <div className="mx-auto w-full max-w-sm">
        <MerioMark className="h-9 w-9" />

        <h1 className="mt-10 font-display text-4xl font-semibold">Welcome back.</h1>

        <p className="mt-2 text-muted">
          Sign in to see who&apos;s paid this month.
        </p>

        <LoginForm />
      </div>
    </main>
  );
}
