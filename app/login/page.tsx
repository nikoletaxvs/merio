import { Button, MerioMark } from "@/components/ui";
import { isDemoMode } from "@/lib/demo";
import { enterDemo } from "./actions";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  const demo = isDemoMode();

  return (
    <main className="page-glow flex min-h-screen w-full items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-brand/25">
            <MerioMark className="h-8 w-8 text-black" />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight">Merio</h1>

          <p className="mt-1.5 text-sm text-white/45">
            {demo
              ? "Explore the owner dashboard with sample data."
              : "Sign in to manage your subscription."}
          </p>
        </div>

        {demo ? (
          <form
            action={enterDemo}
            className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-lg shadow-black/30"
          >
            <ul className="space-y-1.5 text-sm leading-6 text-white/55">
              <li>No sign-up or password needed.</li>
              <li>Change anything: data resets every night.</li>
              <li>Emails are never actually sent.</li>
            </ul>

            <Button type="submit" className="mt-5 w-full">
              Enter the demo
            </Button>
          </form>
        ) : (
          <LoginForm />
        )}
      </div>
    </main>
  );
}
