import { ButtonLink, MerioMark } from "@/components/ui";
import { getDemoUrl } from "@/lib/demo";
import SampleLedger from "./_components/SampleLedger";

export default function Home() {
  const demoUrl = getDemoUrl();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <nav className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <MerioMark className="h-7 w-7" />
            <span className="font-display text-xl font-medium">Merio</span>
          </div>

          <ButtonLink href="/dashboard" variant="ghost" size="sm">
            Sign in
          </ButtonLink>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-4xl flex-1 content-center items-center gap-12 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
        <section>
          <h1 className="font-display text-4xl font-medium leading-tight sm:text-5xl">
            Who&apos;s paid for the family plan this month?
          </h1>

          <p className="mt-5 max-w-md text-lg leading-8 text-muted">
            Merio keeps the answer in one place. Everyone gets a monthly
            payment and their own link to mark it paid, and people who
            haven&apos;t paid get a reminder email, so you don&apos;t have to
            chase them in the group chat.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {demoUrl ? (
              <>
                <ButtonLink href={demoUrl}>Try the demo</ButtonLink>
                <ButtonLink href="/dashboard" variant="secondary">
                  Sign in
                </ButtonLink>
              </>
            ) : (
              <ButtonLink href="/dashboard">Open the dashboard</ButtonLink>
            )}
          </div>
        </section>

        <SampleLedger />
      </main>

      <footer className="border-t border-border">
        <p className="mx-auto w-full max-w-4xl px-6 py-6 text-sm text-muted">
          Merio tracks who has paid. It doesn&apos;t move any money.
        </p>
      </footer>
    </div>
  );
}
