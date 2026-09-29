import Link from "next/link";
import { ButtonLink, MerioMark } from "@/components/ui";
import { getDemoUrl } from "@/lib/demo";
import SampleLedger from "./_components/SampleLedger";

export default function Home() {
  const demoUrl = getDemoUrl();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <MerioMark className="h-7 w-7" />
            <span className="font-display text-xl font-medium">Merio</span>
          </div>

          <ButtonLink href="/dashboard" variant="ghost" size="sm">
            Sign in
          </ButtonLink>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 content-center items-center gap-12 px-6 py-16 md:grid-cols-[1.25fr_1fr] md:pt-24 md:pb-32">
        <section>
          <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
            Who&apos;s paid for the family plan this month?
          </h1>

          <p className="mt-6 max-w-md text-lg leading-8 text-muted">
            Merio keeps the answer in one place. Everyone gets a monthly
            payment and their own link to mark it paid, and people who
            haven&apos;t paid get a reminder email, so you don&apos;t have to
            chase them in the group chat.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
            {demoUrl ? (
              <>
                <ButtonLink href={demoUrl}>Try the demo</ButtonLink>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  I already have an account
                </Link>
              </>
            ) : (
              <ButtonLink href="/dashboard">Open the dashboard</ButtonLink>
            )}
          </div>
        </section>

        <SampleLedger />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap justify-between gap-x-6 gap-y-2 px-6 py-6 text-sm text-muted">
          <p>Merio tracks who has paid. It doesn&apos;t move any money.</p>
          <Link
            href="/privacy"
            className="underline decoration-border-strong underline-offset-4 hover:text-foreground hover:decoration-foreground"
          >
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
