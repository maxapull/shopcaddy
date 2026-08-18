-- ShopCaddy database schema
-- Run this once, in full, in your Supabase project's SQL Editor
-- (Project → SQL Editor → New query → paste this whole file → Run).
-- Safe to re-run: every statement is idempotent (if not exists / or replace).

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

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
-- transactions: the real budget ledger (manual entries + logged purchases)
-- ---------------------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  amount numeric not null check (amount >= 0),
  category text not null,
  note text,
  date date not null default current_date,
  source text not null default 'manual' check (source in ('manual', 'shopping')),
  product_name text,
  retailer text,
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
-- products / product_variants: shared catalog, public read-only
-- (no insert/update/delete policy for anon/authenticated — only the project
-- owner running this script, or the Supabase dashboard, can write to it)
-- ---------------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('food', 'household', 'clothes')),
  retailer text not null,
  price numeric not null check (price >= 0),
  tags text[] not null default '{}',
  eco_score smallint check (eco_score between 1 and 5),
  search_text text generated always as (
    lower(name || ' ' || array_to_string(tags, ' ') || ' ' || retailer)
  ) stored,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

drop policy if exists "Anyone can read products" on products;
create policy "Anyone can read products" on products
  for select
  using (true);

create index if not exists products_search_trgm_idx on products using gin (search_text gin_trgm_ops);
create index if not exists products_category_idx on products (category);

-- Fuzzy product search: substring match (precise) OR trigram similarity
-- above a threshold (tolerates typos/odd phrasing), ranked by relevance
-- then price. Callable directly from the client via supabase.rpc() since
-- products are public-read — no route handler needed for this.
create or replace function search_products(search_query text, result_limit int default 20)
returns setof products
language sql
stable
as $$
  select *
  from products
  where search_text ilike '%' || lower(search_query) || '%'
     or similarity(search_text, lower(search_query)) > 0.15
  order by similarity(search_text, lower(search_query)) desc, price asc
  limit result_limit;
$$;

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  kind text not null check (kind in ('size', 'colour')),
  value text not null,
  in_stock boolean not null default true
);

alter table product_variants enable row level security;

drop policy if exists "Anyone can read product variants" on product_variants;
create policy "Anyone can read product variants" on product_variants
  for select
  using (true);

create index if not exists product_variants_product_idx on product_variants (product_id);

-- ---------------------------------------------------------------------------
-- shopping_lists / shopping_list_items: saved List Maker lists
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
  product_id uuid references products (id),
  quantity integer not null default 1 check (quantity > 0),
  purchased boolean not null default false
);

alter table shopping_list_items enable row level security;

drop policy if exists "Users manage own list items" on shopping_list_items;
create policy "Users manage own list items" on shopping_list_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists shopping_list_items_list_idx on shopping_list_items (list_id);

-- ---------------------------------------------------------------------------
-- Catalog seed data — ShopCaddy's own curated, indicative price panel.
-- Not live retailer data; re-run this section any time to reset the catalog
-- (it clears and re-seeds products/product_variants only — never touches
-- user data in profiles/budgets/transactions/shopping_lists).
-- ---------------------------------------------------------------------------
truncate table product_variants;
truncate table products cascade;

insert into products (name, category, retailer, price, tags, eco_score) values
  -- Food
  ('Semi-Skimmed Milk 2L', 'food', 'Tesco', 1.65, '{milk}', 3),
  ('Semi-Skimmed Milk 2L', 'food', 'Aldi', 1.35, '{milk}', 3),
  ('Farmhouse White Loaf', 'food', 'Sainsbury''s', 1.40, '{bread,loaf}', 3),
  ('Farmhouse White Loaf', 'food', 'Lidl', 1.05, '{bread,loaf}', 3),
  ('Free Range Eggs (12)', 'food', 'Waitrose', 3.60, '{eggs}', 4),
  ('Free Range Eggs (12)', 'food', 'Aldi', 2.75, '{eggs}', 4),
  ('Chicken Breast Fillets 1kg', 'food', 'Tesco', 6.50, '{chicken}', 2),
  ('Chicken Breast Fillets 1kg', 'food', 'Lidl', 5.20, '{chicken}', 2),
  ('Basmati Rice 1kg', 'food', 'Sainsbury''s', 2.80, '{rice}', 3),
  ('Basmati Rice 1kg', 'food', 'Aldi', 1.99, '{rice}', 3),
  ('Curry Cooking Sauce', 'food', 'Tesco', 2.20, '{"curry sauce"}', 3),
  ('Curry Cooking Sauce', 'food', 'Asda', 1.60, '{"curry sauce"}', 3),
  ('Penne Pasta 500g', 'food', 'Tesco', 1.10, '{pasta}', 3),
  ('Penne Pasta 500g', 'food', 'Lidl', 0.65, '{pasta}', 3),
  ('Chopped Tomatoes Tin', 'food', 'Sainsbury''s', 0.95, '{tomato,"tinned tomatoes"}', 3),
  ('Chopped Tomatoes Tin', 'food', 'Aldi', 0.55, '{tomato,"tinned tomatoes"}', 3),
  ('Mature Cheddar 400g', 'food', 'Waitrose', 3.90, '{cheese}', 2),
  ('Mature Cheddar 400g', 'food', 'Aldi', 2.65, '{cheese}', 2),
  ('Bananas (loose, per kg)', 'food', 'Tesco', 1.05, '{banana,fruit}', 4),
  ('Bananas (loose, per kg)', 'food', 'Aldi', 0.79, '{banana,fruit}', 4),
  ('Instant Coffee 200g', 'food', 'Sainsbury''s', 4.50, '{coffee}', 3),
  ('Instant Coffee 200g', 'food', 'Lidl', 3.20, '{coffee}', 3),
  ('Breakfast Tea Bags (80)', 'food', 'Tesco', 3.10, '{tea}', 3),
  ('Breakfast Tea Bags (80)', 'food', 'Aldi', 2.10, '{tea}', 3),
  ('Granulated Sugar 1kg', 'food', 'Sainsbury''s', 1.20, '{sugar}', 3),
  ('Granulated Sugar 1kg', 'food', 'Asda', 0.95, '{sugar}', 3),
  ('Plain Flour 1.5kg', 'food', 'Tesco', 1.15, '{flour}', 3),
  ('Plain Flour 1.5kg', 'food', 'Aldi', 0.85, '{flour}', 3),
  ('Salted Butter 250g', 'food', 'Waitrose', 2.60, '{butter}', 2),
  ('Salted Butter 250g', 'food', 'Lidl', 1.85, '{butter}', 2),
  ('Orange Juice 1L', 'food', 'Tesco', 1.80, '{"orange juice",juice}', 3),
  ('Orange Juice 1L', 'food', 'Aldi', 1.15, '{"orange juice",juice}', 3),
  ('Corn Flakes 500g', 'food', 'Sainsbury''s', 2.50, '{cereal}', 3),
  ('Corn Flakes 500g', 'food', 'Lidl', 1.60, '{cereal}', 3),
  ('Natural Yogurt 500g', 'food', 'Tesco', 1.30, '{yogurt}', 3),
  ('Natural Yogurt 500g', 'food', 'Aldi', 0.89, '{yogurt}', 3),
  ('Apples (loose, per kg)', 'food', 'Waitrose', 2.40, '{apple,fruit}', 4),
  ('Apples (loose, per kg)', 'food', 'Asda', 1.60, '{apple,fruit}', 4),
  ('Potatoes 2.5kg', 'food', 'Tesco', 2.10, '{potato,potatoes}', 4),
  ('Potatoes 2.5kg', 'food', 'Aldi', 1.55, '{potato,potatoes}', 4),
  ('Onions 1kg', 'food', 'Sainsbury''s', 1.10, '{onion,onions}', 4),
  ('Onions 1kg', 'food', 'Asda', 0.75, '{onion,onions}', 4),
  ('Beef Mince 500g', 'food', 'Tesco', 4.20, '{mince,beef}', 2),
  ('Beef Mince 500g', 'food', 'Lidl', 3.30, '{mince,beef}', 2),
  ('Salmon Fillets (2)', 'food', 'Waitrose', 5.50, '{salmon,fish}', 3),
  ('Salmon Fillets (2)', 'food', 'Aldi', 4.20, '{salmon,fish}', 3),
  ('Olive Oil 500ml', 'food', 'Sainsbury''s', 4.80, '{"olive oil"}', 3),
  ('Olive Oil 500ml', 'food', 'Lidl', 3.45, '{"olive oil"}', 3),
  ('Baked Beans Tin', 'food', 'Tesco', 0.75, '{"baked beans",beans}', 3),
  ('Baked Beans Tin', 'food', 'Asda', 0.55, '{"baked beans",beans}', 3),
  ('Digestive Biscuits', 'food', 'Sainsbury''s', 1.10, '{biscuits}', 3),
  ('Digestive Biscuits', 'food', 'Aldi', 0.75, '{biscuits}', 3),
  ('Milk Chocolate Bar', 'food', 'Tesco', 1.50, '{chocolate}', 3),
  ('Milk Chocolate Bar', 'food', 'Asda', 1.10, '{chocolate}', 3),
  ('Sparkling Water 6x1L', 'food', 'Aldi', 2.40, '{water,"sparkling water"}', 4),
  ('Sparkling Water 6x1L', 'food', 'Lidl', 2.20, '{water,"sparkling water"}', 4),

  -- Household
  ('Stainless Steel Kettle 1.7L', 'household', 'Currys', 34.99, '{kettle}', 3),
  ('Stainless Steel Kettle 1.7L', 'household', 'Argos', 24.99, '{kettle}', 3),
  ('Washing-Up Liquid 500ml', 'household', 'Tesco', 1.20, '{"washing up liquid"}', 3),
  ('Washing-Up Liquid 500ml', 'household', 'Asda', 0.85, '{"washing up liquid"}', 3),
  ('Laundry Detergent 40 Wash', 'household', 'Sainsbury''s', 6.50, '{"laundry detergent","washing powder"}', 3),
  ('Laundry Detergent 40 Wash', 'household', 'Aldi', 4.20, '{"laundry detergent","washing powder"}', 3),
  ('Toilet Roll (9 pack)', 'household', 'Tesco', 5.50, '{"toilet roll","toilet paper"}', 3),
  ('Toilet Roll (9 pack)', 'household', 'Asda', 4.10, '{"toilet roll","toilet paper"}', 3),
  ('Bin Bags (20 pack)', 'household', 'Sainsbury''s', 2.80, '{"bin bags"}', 2),
  ('Bin Bags (20 pack)', 'household', 'Aldi', 1.95, '{"bin bags"}', 2),
  ('2-Slice Toaster', 'household', 'Argos', 18.99, '{toaster}', 3),
  ('2-Slice Toaster', 'household', 'Currys', 22.99, '{toaster}', 3),
  ('Vacuum Cleaner', 'household', 'Currys', 89.99, '{vacuum,hoover}', 3),
  ('Vacuum Cleaner', 'household', 'Argos', 74.99, '{vacuum,hoover}', 3),
  ('Bath Towel', 'household', 'Marks & Spencer', 12.00, '{towel}', 3),
  ('Bath Towel', 'household', 'Primark', 6.00, '{towel}', 3),
  ('LED Light Bulb (4 pack)', 'household', 'Tesco', 6.00, '{"light bulb",bulb}', 4),
  ('LED Light Bulb (4 pack)', 'household', 'Argos', 4.50, '{"light bulb",bulb}', 4),
  ('Air Fryer', 'household', 'Currys', 59.99, '{"air fryer"}', 3),
  ('Air Fryer', 'household', 'Argos', 49.99, '{"air fryer"}', 3),

  -- Clothes
  ('Cotton T-Shirt', 'clothes', 'ASOS', 18.00, '{"t-shirt",tshirt,top}', 3),
  ('Cotton T-Shirt', 'clothes', 'Uniqlo', 9.90, '{"t-shirt",tshirt,top}', 4),
  ('Slim Fit Jeans', 'clothes', 'River Island', 48.00, '{jeans}', 2),
  ('Slim Fit Jeans', 'clothes', 'H&M', 27.99, '{jeans}', 2),
  ('Running Shoes', 'clothes', 'JD Sports', 84.99, '{"running shoes",trainers,shoes}', 3),
  ('Running Shoes', 'clothes', 'Decathlon', 39.99, '{"running shoes",trainers,shoes}', 3),
  ('Waterproof Jacket', 'clothes', 'North Face', 130.00, '{jacket,coat}', 3),
  ('Waterproof Jacket', 'clothes', 'Decathlon', 59.99, '{jacket,coat}', 3),
  ('Cotton Socks (5-pack)', 'clothes', 'Marks & Spencer', 12.00, '{socks}', 3),
  ('Cotton Socks (5-pack)', 'clothes', 'Primark', 5.00, '{socks}', 3),
  ('Summer Dress', 'clothes', 'Zara', 39.99, '{dress}', 3),
  ('Summer Dress', 'clothes', 'New Look', 22.99, '{dress}', 3),
  ('Pullover Hoodie', 'clothes', 'Nike', 54.99, '{hoodie,jumper}', 3),
  ('Pullover Hoodie', 'clothes', 'Uniqlo', 29.90, '{hoodie,jumper}', 3),
  ('Wool Jumper', 'clothes', 'Marks & Spencer', 35.00, '{jumper,sweater}', 3),
  ('Wool Jumper', 'clothes', 'H&M', 19.99, '{jumper,sweater}', 3),
  ('Casual Shorts', 'clothes', 'Uniqlo', 19.90, '{shorts}', 3),
  ('Casual Shorts', 'clothes', 'Primark', 8.00, '{shorts}', 3),
  ('Leather Belt', 'clothes', 'Marks & Spencer', 22.00, '{belt}', 3),
  ('Leather Belt', 'clothes', 'Primark', 6.00, '{belt}', 3),
  ('Baseball Cap', 'clothes', 'Nike', 20.00, '{cap,hat}', 3),
  ('Baseball Cap', 'clothes', 'Primark', 4.00, '{cap,hat}', 3),
  ('Swim Shorts', 'clothes', 'Decathlon', 14.99, '{"swim shorts",swimwear}', 3),
  ('Swim Shorts', 'clothes', 'Primark', 7.00, '{"swim shorts",swimwear}', 3);

-- Size variants for clothing products that need them (both retailer rows).
insert into product_variants (product_id, kind, value)
select id, 'size', v.value
from products, (values ('S'), ('M'), ('L'), ('XL')) as v (value)
where name in ('Cotton T-Shirt', 'Waterproof Jacket', 'Pullover Hoodie', 'Wool Jumper', 'Casual Shorts', 'Swim Shorts');

insert into product_variants (product_id, kind, value)
select id, 'size', v.value
from products, (values ('28'), ('30'), ('32'), ('34'), ('36')) as v (value)
where name = 'Slim Fit Jeans';

insert into product_variants (product_id, kind, value)
select id, 'size', v.value
from products, (values ('6'), ('7'), ('8'), ('9'), ('10'), ('11')) as v (value)
where name = 'Running Shoes';

insert into product_variants (product_id, kind, value)
select id, 'size', v.value
from products, (values ('8'), ('10'), ('12'), ('14'), ('16')) as v (value)
where name = 'Summer Dress';
