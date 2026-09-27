# Merio

[![CI](https://github.com/nikoletaxvs/merio/actions/workflows/ci.yml/badge.svg)](https://github.com/nikoletaxvs/merio/actions/workflows/ci.yml)

Merio keeps track of who has paid their share of a family subscription. Each
member gets a monthly payment, a personal link to mark it paid, and reminder
emails until they do.

**Demo:** https://merio-demo-g4ev63ehi-merio1.vercel.app/demo (sample data,
resets nightly, no emails sent)

<!--
  TODO: replace the demo link with the permanent domain from the demo Vercel
  project (Settings → Domains), e.g. https://merio-demo.vercel.app/demo.
  The current per-deployment URL asks visitors to log in to Vercel.
-->

<p>
  <img src="docs/dashboard.png" alt="Owner dashboard showing five members, three of them paid" width="560">
  <img src="docs/pay-page.png" alt="A member's payment page with the amount due and an I've sent button" width="260">
</p>

## Why I built it

<!--
  Write this yourself, 2-4 sentences, in your own words. For example: who
  shares the plan, what was annoying about the old way, what you wanted
  instead. Specific beats polished.
-->

## How it works

The owner adds members and sets the monthly amount. A daily job creates each
member's payment when a new period starts, and another emails anyone who
hasn't paid on day 1, day 7 and then weekly. Members open their link, see what
they owe and their history, and press a button once they've sent the money.
Merio only tracks payments; the money itself moves however the family already
pays each other.

## Decisions worth mentioning

<!--
  Write 3-5 of these yourself, one or two sentences each, as things you could
  defend in an interview. Candidates from this project:
  - payment links use a secret token and the server derives the payment from
    it (the IDOR fix in app/pay/actions.ts)
  - the demo is a separate deployment instead of a guest login on the real one
  - unit tests on the date logic caught a month-end billing bug
  - design tokens: every colour comes from globals.css, so dark mode is free
  - what you'd change if this had many owners instead of one
-->

## Stack

Next.js 16 (App Router, server actions), React 19, TypeScript, Tailwind CSS 4,
Postgres with Drizzle, Nodemailer over Gmail, Vitest, deployed on Vercel with
Vercel Cron.

## Running it locally

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, ...
npx drizzle-kit migrate
npm run dev
```

Set `DEMO_MODE=true` in `.env` (with a throwaway database) to skip the password
and get sample data.

Environment variables, the database schema, how billing and auth work, and how
the demo is deployed are in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Limitations

One owner per deployment, and members mark themselves as paid; Merio trusts
them. Both are fine for a family, and both would need to change before this
could serve strangers.
