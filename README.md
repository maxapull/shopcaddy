# ShopCaddy

Smart shopping, sorted. ShopCaddy is a concept app that combines an AI shopping-list
builder with an autonomous purchasing assistant, for both **food** and **clothes**
shopping.

## The pitch

Households waste hours comparing prices across supermarkets and clothing retailers,
and even more time actually placing orders. ShopCaddy collapses that into one flow:
describe what you need in plain English, get a priced list with cheaper alternatives
found automatically, and — once you link your bank — let the AI complete the purchase
for you in chat. Layered on top: budget tracking, price-drop alerts, a pantry/wardrobe
tracker to avoid duplicate buys, multi-store basket splitting for the lowest total, and
household list sharing. That combination — planning, comparison, and autonomous
checkout in one app — is the wedge for a venture-scale (£10m+) consumer app: high
usage frequency (weekly groceries), a clear savings hook, and a natural upsell into a
take-rate on completed orders or a premium subscription.

## What's in this prototype

This is a working **front-end scaffold** — a real Next.js codebase you can run and
click through — with AI behaviour and bank linking **simulated** using local mock data
and rule-based logic (no real LLM calls, no real bank/Open Banking integration, no real
retailer prices). It's built to demonstrate the product, flows and UI, and to be a
starting point for wiring up real services.

### Core features
- **AI List Maker** (`/list`) — describe what you need (e.g. *"chicken curry for 4"* or
  *"new running shoes and a t-shirt"*) and it's parsed into a priced, itemised list
  spanning food and clothes, with a cheaper alternative suggested per item and a running
  total cost.
- **Chat & auto-purchase** (`/chat`) — ask the assistant to buy something
  (*"buy me a kettle under £30"*) and it finds a match, compares price, and — once you
  link a bank — completes the "purchase" and logs it to Orders.
- **Bank link flow** (mock Open Banking-style consent screen) — required before the
  assistant can check out on your behalf.

### Supporting features
- **Home dashboard** — monthly spend, AI savings, budget progress bar, recent orders.
- **Orders** — history of everything the AI has bought, with savings vs. full price.
- **Account** — bank link management, monthly budget, household members, notification
  preferences.
- Feature previews for **pantry/wardrobe tracking**, **price-drop alerts**,
  **multi-store basket splitting**, and **household sharing** — flagged as the next
  slice of roadmap.

## Design

White background with a single confident orange accent (`#FF7A1A`), rounded cards,
generous spacing, bottom tab navigation — a modern, simple mobile-app shell that also
works in a desktop browser (centred phone-width column).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Try:
1. **List** → type "chicken curry for 4" → tap a cheaper-alternative chip → note the
   total update → "Buy in chat".
2. **Account** → "Link bank" → pick any bank (simulated, ~1s "connecting").
3. **Chat** → "buy me a kettle under £30" → confirm → see it land in **Orders**.

## Architecture notes

- Next.js 14 (App Router) + TypeScript + Tailwind CSS.
- `lib/catalog.ts` — mock product catalog (food, clothes, household) with a cheaper
  alternative wired to most items.
- `lib/ai.ts` — rule-based stand-ins for the two "AI" surfaces: turning a free-text
  request into catalog items (`parseRequestToItems`), and a small intent-matching chat
  responder (`chatRespond`) that handles greetings, buy-intent, and order confirmation.
  Swap these for real LLM calls (e.g. the Claude API) without changing any UI code.
- `lib/store.tsx` — a small React context (persisted to `localStorage`) standing in for
  a backend: bank-link status, order history, saved lists, budget.
- Real bank connectivity would use Open Banking (e.g. TrueLayer/Plaid) for
  confirmation-of-payment, never raw card/credential storage.
