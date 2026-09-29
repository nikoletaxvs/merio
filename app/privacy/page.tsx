import type { Metadata } from "next";
import Link from "next/link";
import { MerioMark } from "@/components/ui";
import { isDemoMode } from "@/lib/demo-mode";
import PolicySection from "./_components/PolicySection";

export const metadata: Metadata = {
  title: "Privacy · Merio",
  description: "What Merio stores about you, why, and how to have it removed.",
};

const LAST_UPDATED = "29 September 2026";

export default function PrivacyPage() {
  const contactEmail = process.env.GMAIL_USER;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-16">
      <Link href="/" className="inline-flex items-center gap-2.5">
        <MerioMark className="h-7 w-7" />
        <span className="font-display text-xl font-medium">Merio</span>
      </Link>

      <h1 className="mt-10 font-display text-4xl font-medium">Privacy</h1>
      <p className="mt-2 text-xs tabular-nums text-muted">Last updated {LAST_UPDATED}</p>

      <p className="mt-6 text-lg leading-8 text-muted">
        Merio is a small tool one person uses to keep track of who has paid
        their share of a shared subscription. It stores as little as it can,
        doesn&apos;t track you, and doesn&apos;t sell or share anything.
      </p>

      {isDemoMode() && (
        <p className="mt-6 rounded-md border border-border bg-surface-muted px-4 py-3 text-sm text-muted">
          This is the public demo. Everything in it is sample data, it&apos;s
          wiped every night, and no emails are sent.
        </p>
      )}

      <PolicySection title="What Merio stores">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Your name and email address, entered by the person who runs the subscription.</li>
          <li>Your share of each month&apos;s cost, and whether and when you marked it paid.</li>
          <li>A secret link token that opens your personal payment page.</li>
        </ul>
        <p className="mt-3">
          That&apos;s all. Merio never handles money or bank details: you pay
          however your family already does, and just tell Merio you&apos;ve
          done it.
        </p>
      </PolicySection>

      <PolicySection title="Why">
        <p>
          To show you what you owe and to email you reminders until your share
          is marked paid. Nothing else.
        </p>
      </PolicySection>

      <PolicySection title="Cookies">
        <p>
          Merio sets one cookie, and only for the person who runs the
          subscription: a login session that lasts 30 days. It&apos;s needed
          for the dashboard to work, so there&apos;s no cookie banner. There are
          no analytics, advertising or tracking cookies, and members&apos;
          payment pages set no cookies at all.
        </p>
      </PolicySection>

      <PolicySection title="Who else handles it">
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="font-medium text-foreground">Vercel</strong> runs the app.</li>
          <li><strong className="font-medium text-foreground">Neon</strong> stores the database, in Frankfurt, Germany.</li>
          <li><strong className="font-medium text-foreground">Google (Gmail)</strong> delivers the reminder emails.</li>
        </ul>
        <p className="mt-3">They process the data only to provide those services.</p>
      </PolicySection>

      <PolicySection title="How long it's kept">
        <p>
          For as long as you&apos;re part of the subscription. When you&apos;re
          removed, your payments and your name and email are deleted
          straight away.
        </p>
      </PolicySection>

      <PolicySection title="Your choices">
        <p>
          You can ask to see what&apos;s stored about you, to correct it, or to
          be removed at any time. Removal also stops the reminder emails.
        </p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>
          The person who runs your subscription decides who&apos;s in it, so
          they&apos;re the one to ask. You can reply to any reminder email to
          reach them
          {contactEmail ? (
            <>
              , or write to{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
              >
                {contactEmail}
              </a>
            </>
          ) : null}
          .
        </p>
      </PolicySection>
    </main>
  );
}
