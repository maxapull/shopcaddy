# ShopCaddy

Your AI shopping and budget assistant. ShopCaddy compares prices across retailers,
builds priced shopping lists, and helps you track and stick to a budget — across
**food**, **household**, and **clothes**.

## What it actually does

- **AI List Maker** (`/list`) — describe what you need in one message (e.g. *"milk,
  bread and a kettle"*) and it's matched against the catalog into a priced, itemised
  list. Every item shows every retailer that stocks it, cheapest first, and you can
  switch between them with one tap.
- **Chat assistant** (`/chat`) — ask it to find something, ask where it's cheapest, ask
  whether you can afford it this month, or ask for money-saving tips. It finds real
  matches from the catalog and gives you a direct link to the retailer to complete your
  purchase — then, once you actually have, tell it and it logs the spend to your budget.
- **Budget** (`/orders`) — the real transaction ledger. Log spend manually or via Chat,
  see spend-by-category against the budgets you set, edit or delete anything.
- **Account** (`/account`) — your overall and per-category monthly budgets, and your
  session.

## What it deliberately doesn't do

- **It doesn't execute purchases for you.** Completing a real payment on your behalf
  needs FCA/Open Banking authorization — not something a codebase can grant itself.
  ShopCaddy finds and compares, hands you a link, and lets you log what you actually
  spent.
- **It isn't a live price-comparison feed.** The catalog (100 products across food,
  household, and clothes) is ShopCaddy's own curated, indicative price panel — real
  product names and realistic UK pricing, but not pulled live from retailers. Wiring up
  a real feed (affiliate networks like Awin/CJ/Rakuten, or direct retailer APIs) is the
  natural next step for a production launch.
- **It doesn't use a paid LLM.** Understanding what you type is a local, free
  keyword/fuzzy-matching engine (`lib/assistant.ts`, Postgres trigram search in
  `lib/catalog.ts`) — good at flexible phrasing and typos, not true language
  understanding. Swapping in a real LLM call is a contained change if that tradeoff
  ever flips.
- Pantry/wardrobe tracking, price-drop alerts, multi-store basket splitting, and
  household sharing are on the roadmap (see the "Coming soon" cards on Home) — not
  built yet.

## Architecture

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS.
- **Supabase** (Postgres + Auth) for real accounts and data — see [`SETUP.md`](SETUP.md)
  to connect your own project (required to run the app; a `/setup` page walks through
  it if it isn't configured yet).
- **Row Level Security** on every user-owned table, scoped to `auth.uid()` — see
  [`supabase/schema.sql`](supabase/schema.sql).
- Server Components fetch data; **Server Actions** (`lib/actions.ts`) handle every
  mutation (transactions, budgets, saved lists); the product/variant search is a
  Postgres function (`search_products`) called directly from the client, since the
  catalog is public read-only data.
- `lib/catalog.ts` — search, retailer deep-links, delivery estimates.
- `lib/assistant.ts` — the chat/list "AI": intent detection, budget-aware answers,
  variant (size/colour) picking.

## Getting started

See [`SETUP.md`](SETUP.md) for the one-time Supabase setup, then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and try:
1. **Chat** → "cheapest milk" → see every retailer, cheapest first.
2. **Chat** → "buy me a hoodie" → pick a brand → pick a size → "Buy" opens the retailer
   → "I bought this" logs it to your budget.
3. **Budget** → see it show up, edit the amount, or add a manual spend.
4. **Account** → set a category budget → watch Home's progress bar reflect it.
