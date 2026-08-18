# Setup

ShopCaddy needs a Supabase project (Postgres database + auth) to run. This is a
one-time step — everything else in the app is already wired up to use it.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up / sign in (free tier is enough).
2. Click **New project**. Pick any name and a database password (save the password
   somewhere — you won't need it day-to-day, Supabase manages the connection for you).
3. Wait ~1-2 minutes for the project to finish provisioning.

## 2. Run the database schema

1. In your new project, open **SQL Editor** in the left sidebar → **New query**.
2. Open [`supabase/schema.sql`](supabase/schema.sql) from this repo, copy its entire
   contents, and paste into the query editor.
3. Click **Run**. This creates every table, security policy, and the product catalog
   (100 seeded products) in one go. It's safe to re-run any time — it won't touch your
   users' accounts, budgets, or transactions, only the shared catalog.

## 3. Get your API keys

1. In the project, go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key (not the `service_role` key —
   the app never needs that one).

## 4. Configure the app

**Locally:**

```bash
cp .env.local.example .env.local
```

Paste your Project URL and anon key into `.env.local`, then:

```bash
npm install
npm run dev
```

**On Vercel** (for the deployed site):

1. Project → **Settings → Environment Variables**.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the same
   values, for both **Production** and **Preview**.
3. Redeploy (or push a new commit — Vercel redeploys automatically on push to `main`).

## That's it

Visit the site, sign up with any email/password, and you're in. If Supabase's default
"confirm your email" setting is on, check your inbox for the confirmation link before
signing in (you can turn this off in Supabase → **Authentication → Providers → Email**
for faster local testing).

If the app is misconfigured (missing or wrong env vars), it shows a `/setup` page with
these same steps instead of crashing.
