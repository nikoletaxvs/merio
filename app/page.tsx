import type { ReactNode } from "react";
import { Button, SpotifyMark } from "@/components/ui";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <SpotifyMark className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight">
              Spotify Payments
            </span>
          </div>
          <Button href="/dashboard" variant="secondary" className="px-4">
            Dashboard
          </Button>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-[44rem] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />
          <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-24 text-center sm:py-32">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted">
              <span className="h-2 w-2 rounded-full bg-brand" />
              Spotify Premium split, made simple
            </span>

            <h1 className="mt-6 max-w-2xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Split your Spotify Premium,{" "}
              <span className="text-brand">effortlessly</span>.
            </h1>

            <p className="mt-6 max-w-xl text-balance text-lg leading-8 text-muted">
              Invite your friends, generate monthly payments automatically, and
              know exactly who&apos;s paid — without the awkward group-chat
              math.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="/dashboard">Open dashboard</Button>
              <Button href="/dashboard" variant="secondary">
                Learn how it works
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto grid w-full max-w-5xl gap-4 px-6 py-16 sm:grid-cols-3">
            <Feature
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              }
              title="Automatic billing"
              description="Payments are generated every month on schedule — no reminders needed."
            />
            <Feature
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              }
              title="Shareable links"
              description="Each member gets a personal link to see their share and confirm payment."
            />
            <Feature
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11 3 17v4h4l6-6" />
                  <path d="M10.8 12.2 20.6 2.4a1.9 1.9 0 0 1 2.7 0l.3.3a1.9 1.9 0 0 1 0 2.7L13.8 14.2" />
                  <path d="m9 11 4 4" />
                </svg>
              }
              title="Track who's paid"
              description="See paid and pending at a glance so everyone stays accountable."
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-5xl px-6 py-8 text-sm text-muted">
          Built for friends who share one plan.
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-brand">
        {icon}
      </div>
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mt-1.5 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
