# Merio

**Shared subscription payments, made simple.**

Merio splits a shared subscription — like a Spotify family plan — between the
people who actually use it. The owner adds members, Merio generates a payment
for each of them every month, and everyone gets a personal link to confirm what
they owe. No group-chat math, no chasing.

🌐 **Live app:** https://merio-puce.vercel.app

---

## How it works

1. **Add members.** The owner enters a name and email for each person sharing
   the subscription.
2. **Payments generate automatically.** A daily cron creates a `pending`
   payment for every member at the start of each billing period.
3. **Members get their link.** Each member has a unique token, so they get a
   personal `/pay/<token>` page showing their amount and period, plus an email
   reminder on a fixed cadence (day 1, day 7, then weekly).
4. **Members confirm.** After transferring the money, the member clicks
   "I've paid €X" on their link.
5. **The dashboard shows who owes what** — per member, per period, with a
   progress bar and full payment history.

> Payments are tracked manually. Merio records the split and chases payments;
> it does not move money or integrate with a payment processor.

---

## Stack

| Piece | Choice |
| --- | --- |
| Framework | Next.js 16.3 (App Router) + React 19.2 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`@theme inline` tokens, light/dark) |
| Database | PostgreSQL via Drizzle ORM + `postgres` (postgres.js) |
| Email | Nodemailer over Gmail SMTP |
| Auth | Hand-rolled HMAC-SHA256 session cookie (no auth library) |
| Hosting | Vercel, with Vercel Cron for billing jobs |

## Features

- **Automatic billing** — payments created on schedule, idempotent, with a
  manual "activate all" escape hatch and a live countdown to the next run.
- **Shareable payment links** — token-based, no login required for members.
- **Payment tracking** — pending/paid status, per-period history, and a family
  progress bar.
- **Reminder cadence** — day 1, day 7, then weekly, skipping anyone already
  paid. A dashboard panel can simulate a cron run at any datetime without
  sending anything.
- **Member management** — add, edit, delete, per-member manual nudge, and
  copy-link.
- **Family settings** — subscription name, family name, logo/photo, monthly
  amount, period start, and generation day.
- **Public payment page** — amount, period, and the member's own history.

---

## Getting started

```bash
npm install
npm run dev
```

Environment variables are read from `.env.local` in development — see the
table below. Nothing works without `DATABASE_URL` and `AUTH_SECRET`.

Open [http://localhost:3000](http://localhost:3000).

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

---

## Environment variables

Create a `.env.local` file in the project root for development. All of these
are required in production. `.env*` is gitignored — no example file is
checked in, so this table is the source of truth.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string, used by the app, Drizzle Kit, and the seed script. |
| `AUTH_SECRET` | yes | HMAC-SHA256 secret used to sign session cookies and hash the owner password. The app throws on startup if unset. |
| `OWNER_PASSWORD` | yes | The single shared dashboard password. If unset, login always fails. |
| `CRON_SECRET` | yes | Bearer token guarding the cron endpoints. Vercel sends it automatically. |
| `GMAIL_USER` | yes | Gmail account used to send mail (also the `From:` address). |
| `GMAIL_APP_PASSWORD` | yes | Google **app password** for `GMAIL_USER`, not the account password. |
| `APP_URL` | no | Explicit public URL used to build payment links in emails. Trailing slashes are stripped. |
| `VERCEL_PROJECT_PRODUCTION_URL` | no | Set automatically on Vercel; the preferred fallback for resolving the site URL. |
| `VERCEL_URL` | no | Secondary Vercel fallback (per-deployment URL). |
| `NODE_ENV` | no | Standard Next.js variable; toggles the `secure` flag on the session cookie. |

### Resolving the site URL

Payment links in emails are built from the first available source:

`APP_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → the request
`Host` / `x-forwarded-proto` headers → `http://localhost:3000`.

Locally, cron requests arrive without a sensible host, so set `APP_URL` if you
want emailed links to resolve to your dev server.

---

## Database

Schema lives in `db/schema.ts`, migrations in `drizzle/`, configured by
`drizzle.config.ts`.

| Table | Purpose |
| --- | --- |
| `users` | One row per person (owner and members) |
| `subscriptions` | The shared plan: amount, period start, generation day, family name/photo |
| `members` | Which user belongs to which subscription, plus their unique payment `token` |
| `payments` | One row per member per period: amount, period bounds, status, `paid_at` |

Unique indexes prevent duplicate membership and duplicate payments for the same
period (`unique(member_id, period_start)`).

### Applying migrations

Migrations are run manually — no npm script wraps `drizzle-kit`:

```bash
npx drizzle-kit migrate    # apply migrations
npx drizzle-kit generate   # generate a new migration after a schema change
npx drizzle-kit studio     # browse data
```

### Seeding demo history

`scripts/seed-history.mjs` backfills payments for past billing periods so the
dashboard has multi-month history to display. Oldest periods are marked paid,
the most recent past period is left pending. It's idempotent — existing rows
are skipped.

```bash
node scripts/seed-history.mjs        # 3 past periods (default)
node scripts/seed-history.mjs 6      # 6 past periods
```

---

## Architecture

```
app/
  page.tsx                    landing page
  login/                      owner sign-in
  dashboard/                  member + payment management (session-protected)
    actions.ts                server actions (all session-guarded)
    forms.tsx                 add member, family settings, cron simulator
    MemberRow.tsx             per-member accordion: history, edit, delete, remind
    OverviewCard.tsx          amount / generation day / billing period
    PeriodCountdown.tsx       live countdown to the next payment run
    payment-generation.ts     create the period's pending payments
    period-reminders.ts       reminder cadence + email templates
  pay/[token]/                public member payment page
  api/payments/generate/      cron: generate payments
  api/payments/remind/        cron: send reminders
  api/test-email/             dev-only email smoke test
components/ui.tsx             shared UI primitives
lib/
  auth.ts                     session cookie helpers
  auth-tokens.ts              HMAC tokens + password check
  base-url.ts                 site URL resolution
  email.ts                    Nodemailer transporter
  periods.ts                  billing period date math (shared client/server)
proxy.ts                      Next 16 proxy — protects /dashboard
```

### Routes

| Route | Access | Notes |
| --- | --- | --- |
| `/` | public | Marketing page |
| `/login` | public | Owner sign-in |
| `/dashboard` | session cookie | Forced dynamic |
| `/pay/[token]` | possession of the token | Forced dynamic |
| `GET /api/payments/generate` | `Bearer CRON_SECRET` | Vercel cron, daily 00:00 UTC |
| `GET /api/payments/remind` | `Bearer CRON_SECRET` | Vercel cron, daily 09:00 UTC |

### Auth

Session tokens are `<expiresAtMs>.<hexHmac>` in a `merio_session` cookie
(`httpOnly`, `sameSite=lax`, `secure` in production, 30-day TTL). Password
verification compares `HMAC(input)` against `HMAC(OWNER_PASSWORD)` with a
constant-time compare. `proxy.ts` — Next 16's replacement for `middleware.ts` —
guards `/dashboard`.

---

## Deployment

Deployed to Vercel. `vercel.json` registers two daily cron jobs:

```json
{
  "crons": [
    { "path": "/api/payments/generate", "schedule": "0 0 * * *" },
    { "path": "/api/payments/remind", "schedule": "0 9 * * *" }
  ]
}
```

Set every variable from the table above in the Vercel project. Vercel injects
`Authorization: Bearer $CRON_SECRET` on cron requests, which is what the
handlers check. If `CRON_SECRET` is unset the endpoints accept a literal
`Bearer undefined`, so always set it.

---

## Notes and limitations

Worth knowing before you extend this:

- **Single owner.** Every query is scoped to a hardcoded `ownerId = 1`. This is
  a personal tool, not multi-tenant SaaS.
- **No payment processing.** Members transfer money out-of-band and self-attest.
  Anyone holding a payment link can mark it paid.
- **`/api/test-email` is unauthenticated** and sends to a hardcoded address. It
  is a dev leftover — delete or protect it before exposing a deployment.
- **No rate limiting on `/login`.**
- `createSubscription` in `app/dashboard/actions.ts` is defined but never
  called.
- `public/*.svg` are unused `create-next-app` defaults.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
