# ShopCaddy

Your AI budget assistant. ShopCaddy helps you plan what you need, log what you
actually spend, and stay on top of a budget — in plain conversation or in a
straightforward form.

## What it actually does

- **Chat assistant** (`/chat`) — tell it what you spent ("spent £12 on lunch") and
  it'll log it against the right category once you confirm. Ask "how's my budget",
  or "can I afford £50 on a jacket" and it answers from your real numbers. Ask for
  money-saving tips.
- **List Maker** (`/list`) — add items with the price you expect to pay; ShopCaddy
  totals and organises the list and can save it for later.
- **Budget** (`/orders`) — the full transaction ledger. Every spend, logged manually
  here or via Chat, with spend-by-category against the budgets you set. Edit or
  delete anything.
- **Account** (`/account`) — your overall and per-category monthly budgets, and your
  session.

## What it deliberately doesn't do

- **There is no product catalog and no price lookup.** ShopCaddy doesn't know what
  a jacket costs, what's in stock, or where anything is cheapest — every amount in
  this app is something you told it yourself. Earlier drafts of this project had a
  curated "indicative" product catalog for Chat to search; that always risked
  reading as real retailer data when it wasn't, so it's gone. What's left is
  honest: a budget tool that only ever repeats numbers back to you.
- **It doesn't execute purchases for you.** There's nothing to buy through
  ShopCaddy — it's a ledger and an assistant, not a checkout.
- **It doesn't use a paid LLM.** Understanding what you type (an amount, a
  category, "how's my budget") is local, free pattern-matching
  (`lib/assistant.ts`) — good at flexible phrasing, not true language
  understanding.
- Pantry/wardrobe tracking, price-drop alerts, multi-store basket splitting, and
  household sharing are on the roadmap (see the "Coming soon" cards on Home) — not
  built.

## Architecture

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS.
- **Supabase** (Postgres + Auth) for real accounts and data — see [`SETUP.md`](SETUP.md)
  to connect your own project (required to run the app; a `/setup` page walks through
  it if it isn't configured yet).
- **Row Level Security** on every table, scoped to `auth.uid()` — see
  [`supabase/schema.sql`](supabase/schema.sql).
- Server Components fetch data; **Server Actions** (`lib/actions.ts`) handle every
  mutation (transactions, budgets, saved lists).
- `lib/assistant.ts` — the chat "AI": intent detection, budget-aware answers,
  amount/category extraction from free text.
- `lib/categories.ts` — the fixed budget category list used across the app.

## Getting started

See [`SETUP.md`](SETUP.md) for the one-time Supabase setup, then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and try:
1. **Chat** → "spent £12 on lunch" → confirm the category → see it logged.
2. **Chat** → "how's my budget this month?"
3. **Budget** → edit or delete what you just logged, or add a spend manually.
4. **Account** → set a category budget → watch Home's progress bar reflect it.
