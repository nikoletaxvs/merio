# Development notes

Reference for running, deploying and changing Merio. The [README](../README.md)
has the short version.

## Setup

```bash
npm install
cp .env.example .env
npx drizzle-kit migrate
npm run dev
```

Use `.env`, not `.env.local`. Next.js reads both, but `drizzle-kit` and the
seed script only load `.env`.

Scripts:

```
npm run dev          dev server
npm run build        production build
npm run lint         ESLint
npm run typecheck    generate Next route types, then tsc --noEmit
npm test             Vitest (npm run test:watch to watch)
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck and tests on every push to
`main` and on pull requests.

## Project structure

```
app/
  dashboard/
    page.tsx              fetches data and composes the page
    _actions/             server actions, one file per domain
                          (members, subscription, billing, session)
    _components/          dashboard-only UI
      member-row/         MemberRow and the pieces it's built from
  pay/[token]/            the member's payment page
  api/                    cron endpoints
components/ui/            shared primitives (Button, Badge, Icon, ...),
                          imported from "@/components/ui"
lib/
  billing/                periods, reminder cadence, payment generation,
                          reminder emails (+ unit tests)
  owner.ts                OWNER_ID, the single-owner assumption in one place
```

Folders starting with `_` are private: Next.js doesn't turn them into routes.
Client components import their server actions directly instead of receiving
them as props.

## Environment variables

Required everywhere:

- `DATABASE_URL`: Postgres connection string.
- `AUTH_SECRET`: signs session cookies. The app throws if it's missing.
- `CRON_SECRET`: bearer token for the cron routes. If it's unset, those routes
  reject every request.

Required on the real deployment:

- `OWNER_PASSWORD`: the dashboard password. Use something long.
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`: the Gmail account reminders are sent
  from. The password is a Google app password, not the account password.

Optional:

- `APP_URL`: public URL used in emailed links. Without it the app falls back to
  `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`, then the request's `Host`
  header. Set it locally if you want emailed links to point at your dev server.
- `DEMO_MODE=true`: demo deployment only (see below).
- `DEMO_URL`: on the real deployment, the demo's `/demo` URL. Adds a "Try the
  demo" button to the landing page. Read at build time, so redeploy after
  changing it.

## Database

Schema in `db/schema.ts`, migrations in `drizzle/`.

- `users`: everyone, owner and members.
- `subscriptions`: the shared plan (amount per member, period start date,
  generation day, family name and photo).
- `members`: links a user to a subscription and holds their secret pay-link
  `token`.
- `payments`: one row per member per period, unique on
  `(member_id, period_start)` so a period can't be billed twice.

```bash
npx drizzle-kit generate   # new migration after changing schema.ts
npx drizzle-kit migrate    # apply migrations
npx drizzle-kit studio     # browse data
node scripts/seed-history.mjs 6   # backfill 6 past periods of payments
```

## How billing works

- Periods run from the subscription's start day to the same day next month.
  Start days past the 28th are clamped to the last day of shorter months
  (Jan 31, Feb 28, Mar 31). The logic is in `lib/billing/periods.ts` and most of the
  tests are about it.
- `/api/payments/generate` (daily cron) creates a `pending` payment for any
  member who doesn't have one for the current period. Running it twice is
  harmless.
- `/api/payments/remind` (daily cron) emails unpaid members on day 1 and day 7
  of the period, then weekly. `?date=YYYY-MM-DD` runs it as if it were another
  day.
- Members mark their own payment as paid from `/pay/<token>`. The action only
  accepts the token and finds the payment on the server, so a link can only
  settle its own member's current payment.

## Auth

There's a single owner. Logging in checks the password with a constant-time
compare and sets a signed `merio_session` cookie (`<expiry>.<hmac>`, httpOnly,
30 days). `proxy.ts` sends anyone without a valid cookie to `/login`. Every
dashboard server action checks the session again, because server actions are
public endpoints.

## Deployment

The app is on Vercel. `vercel.json` defines three daily crons: generate
(00:00 UTC), remind (09:00 UTC) and demo reset (03:00 UTC, a no-op unless
`DEMO_MODE` is on). Vercel sends `Authorization: Bearer $CRON_SECRET` with
each cron request.

### Demo deployment

The real deployment has real people's data, so the public demo is a second
Vercel project on the same repo, with its own database and `DEMO_MODE=true`.
In demo mode:

- `/demo`, and any protected page, signs the visitor in and opens the
  dashboard. There's no password.
- The database is filled with a sample family on the first visit and reset
  every night, or from the "Reset data" button.
- Emails are logged instead of sent, so nobody can use the demo to email real
  addresses.
- `/pay/demo-alex` and the other `demo-*` tokens show the member view.

`resetDemoData` won't run unless demo mode is on and the database is either
empty or owned by the demo account. Setting `DEMO_MODE` on the wrong
deployment can't wipe real data.

## Known limitations

- One owner per deployment. Queries use a hardcoded `ownerId = 1`.
- Members mark themselves as paid. Nothing checks that money actually moved.
- No rate limiting on `/login`.
