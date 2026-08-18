-- ShopCaddy database schema
-- Run this once, in full, in your Supabase project's SQL Editor
-- (Project → SQL Editor → New query → paste this whole file → Run).
-- Safe to re-run: every statement is idempotent (if not exists / or replace).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles: one row per user, auto-created on signup (see trigger below)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  monthly_budget numeric not null default 400,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "Users manage own profile" on profiles;
create policy "Users manage own profile" on profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- budgets: per-category monthly limits, set by the user on /account
-- ---------------------------------------------------------------------------
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null,
  monthly_limit numeric not null check (monthly_limit >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, category)
);

alter table budgets enable row level security;

drop policy if exists "Users manage own budgets" on budgets;
create policy "Users manage own budgets" on budgets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- transactions: the budget ledger — every spend is entered by the user,
-- either directly on /orders or via a "log this" confirmation in Chat.
-- There is no product catalog and no automated purchasing anywhere in this
-- app — every amount here is something the user told ShopCaddy themselves.
-- ---------------------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  amount numeric not null check (amount >= 0),
  category text not null,
  note text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table transactions enable row level security;

drop policy if exists "Users manage own transactions" on transactions;
create policy "Users manage own transactions" on transactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists transactions_user_date_idx on transactions (user_id, date desc);

-- ---------------------------------------------------------------------------
-- shopping_lists / shopping_list_items: saved List Maker lists. Every item is
-- typed in by the user (name, category, price, quantity) — there's no
-- catalog behind it, ShopCaddy just organises and totals what you enter.
-- ---------------------------------------------------------------------------
create table if not exists shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

alter table shopping_lists enable row level security;

drop policy if exists "Users manage own lists" on shopping_lists;
create policy "Users manage own lists" on shopping_lists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references shopping_lists (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  category text not null,
  price numeric not null default 0 check (price >= 0),
  quantity integer not null default 1 check (quantity > 0)
);

-- Added after the initial release, for the "past items" search when adding
-- to a list — safe to re-run against an already-migrated project.
alter table shopping_list_items add column if not exists created_at timestamptz not null default now();

alter table shopping_list_items enable row level security;

drop policy if exists "Users manage own list items" on shopping_list_items;
create policy "Users manage own list items" on shopping_list_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists shopping_list_items_list_idx on shopping_list_items (list_id);
create index if not exists shopping_list_items_user_recent_idx on shopping_list_items (user_id, created_at desc);
