# Trading Journal

A multi-page trading journal built with Next.js (App Router) — dashboard with
an equity curve and live statistics, a monthly P/L calendar, a trade log you
can add/edit/delete, and account settings. Built for XAUUSD but works for any
symbol.

## Why Supabase (and where GitHub fits)

These are two different, complementary pieces:

- **Supabase** is the *backend*: a hosted Postgres database plus
  authentication. It stores your trades and account settings and makes sure
  each user only ever sees their own data (via Row Level Security). This app
  is wired directly to it — there's no separate API server to build or run.
- **GitHub** is just where the *code* lives. Vercel deploys by connecting to
  a GitHub repository: every push to `main` triggers a new deployment
  automatically. GitHub itself doesn't store any trading data.

So the flow is: your code → GitHub → Vercel (hosting) → Supabase (database),
with Vercel and Supabase talking to each other through environment variables.

If Supabase isn't configured, the app still runs — it falls back to a
**demo mode** with 60 sample XAUUSD trades (see `src/lib/mock-data.ts`) and
disables sign-in/editing. This is what you'll see if you run it right now
without any setup.

## 1. Run it locally (demo mode, no setup)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll see the dashboard populated with sample
data.

## 2. Connect Supabase (for real accounts and real trades)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, open **SQL Editor**, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates
   the `trades` and `account_settings` tables, enables Row Level Security,
   and adds a trigger that gives every new user a starting account
   automatically.
3. Go to **Settings → API** and copy the **Project URL** and **anon public**
   key.
4. Copy `.env.example` to `.env.local` and paste those two values in.
5. Restart `npm run dev`. The demo banner disappears and you'll land on
   `/login` to create an account.
6. (Optional) To preload the same 60 sample trades into your own account:
   sign up first, find your user ID in **Authentication → Users**, then run
   [`supabase/seed.sql`](./supabase/seed.sql) in the SQL editor with
   `:user_id` replaced by that UUID.

## 3. Push to GitHub

```bash
git init   # already done if you started from this scaffold
git add .
git commit -m "Initial trading journal"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 4. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub
   repository you just pushed.
2. In the import screen, add the same two environment variables from
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Click **Deploy**. Every future push to `main` redeploys automatically.
4. In Supabase, go to **Authentication → URL Configuration** and add your
   `https://your-app.vercel.app` domain to the allowed redirect URLs so
   sign-in works in production.

## Project structure

```
src/
  app/
    (app)/           # dashboard, calendar, trades, settings — behind the sidebar
    login/            # sign in / sign up
  components/          # UI: charts, tables, calendar grid, forms
  lib/
    stats.ts           # every statistic (win rate, RRR, Sharpe, expectancy,
                        # profit factor, equity curve, calendar aggregates…)
                        # is computed live from the trades array — nothing
                        # is hardcoded
    supabase/           # browser/server/middleware Supabase clients
    mock-data.ts        # demo-mode sample data
supabase/
  schema.sql            # tables + Row Level Security policies
  seed.sql              # optional: load the 60 sample trades into a real account
```

## Statistics shown

Win rate, average profit, average loss, number of trades, total lots, Sharpe
ratio, average RRR (risk/reward), expectancy, profit factor, buy/sell ratio,
balance, equity, unrealized P/L, progress toward your profit target, daily
summary table, monthly P/L calendar with per-day color coding and
trading-day/win-day counts. All of it recalculates automatically as you add,
edit, or delete trades — there are no hardcoded numbers.

## Tech stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS v4 · Recharts · Supabase
(Postgres + Auth) · deployed on Vercel.
