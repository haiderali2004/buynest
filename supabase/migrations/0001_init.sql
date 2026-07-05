-- =========================================================
-- BuyNest E-Commerce Platform — Initial Database Schema
-- Target: Supabase (PostgreSQL 15+)
-- File:   supabase/migrations/0001_init.sql
-- =========================================================

-- ---------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- fuzzy product name search

-- ---------------------------------------------------------
-- 1. ENUM TYPES
-- ---------------------------------------------------------
create type user_role as enum ('customer', 'admin', 'super_admin');
create type gender_category as enum ('men', 'women', 'unisex', 'kids');
create type order_status as enum (
  'pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'
);
create type payment_status as enum ('unpaid', 'paid', 'failed', 'refunded', 'partially_refunded');
create type discount_type as enum ('percentage', 'fixed_amount');
create type contact_status as enum ('new', 'in_progress', 'resolved');

-- ---------------------------------------------------------
-- 2. UTILITY: generic updated_at trigger function
-- ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------
-- 3. PROFILES  (1:1 extension of auth.users)
-- ---------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new Supabase Auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------
-- 4. ADDRESSES
-- ---------------------------------------------------------
create table public.addresses (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  label          text default 'Home',
  full_name      text not null,
  phone          text not null,
  address_line1  text not null,
  address_line2  text,
  city           text not null,
  state          text not null,
  postal_code    text not null,
  country        text not null default 'India',
  is_default     boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_addresses_user_id on public.addresses(user_id);

create trigger trg_addresses_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 5. CATEGORIES (self-referencing, supports subcategories)
-- ---------------------------------------------------------
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  image_url     text,
  parent_id     uuid references public.categories(id) on delete set null,
  display_order int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_categories_slug on public.categories(slug);
create index idx_categories_parent_id on public.categories(parent_id);

create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 6. PRODUCTS
-- ---------------------------------------------------------
create table public.products (
  id                uuid primary key default gen_random_uuid(),
  category_id       uuid references public.categories(id) on delete set null,
  name              text not null,
  slug              text not null unique,
  description       text not null default '',
  brand             text not null default 'BuyNest',
  gender            gender_category not null default 'unisex',
  base_price        numeric(10,2) not null check (base_price >= 0),
  compare_at_price  numeric(10,2) check (compare_at_price >= 0),
  currency          text not null default 'INR',
  sku               text unique,
  material          text,
  care_instructions text,
  is_active         boolean not null default true,
  is_featured       boolean not null default false,
  meta_title        text,
  meta_description  text,
  avg_rating        numeric(3,2) not null default 0,
  review_count      int not null default 0,
  created_by        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_products_slug on public.products(slug);
create index idx_products_category_id on public.products(category_id);
create index idx_products_is_active on public.products(is_active);
create index idx_products_name_trgm on public.products using gin (name gin_trgm_ops);

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 7. PRODUCT VARIANTS (size / color / stock)
-- ---------------------------------------------------------
create table public.product_variants (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  size            text not null,
  color           text not null,
  color_hex       text,
  sku             text unique,
  price_override  numeric(10,2) check (price_override >= 0),
  stock_quantity  int not null default 0 check (stock_quantity >= 0),
  weight_grams    int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (product_id, size, color)
);

create index idx_variants_product_id on public.product_variants(product_id);

create trigger trg_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 8. PRODUCT IMAGES
-- ---------------------------------------------------------
create table public.product_images (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  variant_id     uuid references public.product_variants(id) on delete cascade,
  url            text not null,
  alt_text       text,
  display_order  int not null default 0,
  is_primary     boolean not null default false,
  created_at     timestamptz not null default now()
);

create index idx_images_product_id on public.product_images(product_id);
create index idx_images_variant_id on public.product_images(variant_id);

-- ---------------------------------------------------------
-- 9. REVIEWS
-- ---------------------------------------------------------
create table public.reviews (
  id                    uuid primary key default gen_random_uuid(),
  product_id            uuid not null references public.products(id) on delete cascade,
  user_id               uuid not null references public.profiles(id) on delete cascade,
  order_item_id         uuid, -- FK added after order_items is created below
  rating                int not null check (rating between 1 and 5),
  title                 text,
  comment               text,
  is_verified_purchase  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (product_id, user_id)
);

create index idx_reviews_product_id on public.reviews(product_id);

create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- Keep products.avg_rating / review_count in sync whenever reviews change
create or replace function public.refresh_product_rating()
returns trigger
language plpgsql
as $$
declare
  pid uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
  set avg_rating   = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where product_id = pid), 0),
      review_count = (select count(*) from public.reviews where product_id = pid)
  where p.id = pid;
  return null;
end;
$$;

create trigger trg_reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

-- ---------------------------------------------------------
-- 10. WISHLISTS
-- ---------------------------------------------------------
create table public.wishlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index idx_wishlists_user_id on public.wishlists(user_id);

-- ---------------------------------------------------------
-- 11. CART ITEMS
-- ---------------------------------------------------------
create table public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  variant_id  uuid not null references public.product_variants(id) on delete cascade,
  quantity    int not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, variant_id)
);

create index idx_cart_items_user_id on public.cart_items(user_id);

create trigger trg_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- 12. DISCOUNTS / COUPONS
-- ---------------------------------------------------------
create table public.discounts (
  id                   uuid primary key default gen_random_uuid(),
  code                 text not null unique,
  description          text,
  discount_type        discount_type not null,
  value                numeric(10,2) not null check (value > 0),
  min_purchase_amount  numeric(10,2) not null default 0,
  max_uses             int,
  used_count           int not null default 0,
  starts_at            timestamptz not null default now(),
  expires_at           timestamptz,
  is_active            boolean not null default true,
  created_at           timestamptz not null default now()
);

create index idx_discounts_code on public.discounts(code);

-- ---------------------------------------------------------
-- 13. ORDERS
-- ---------------------------------------------------------
create table public.orders (
  id                         uuid primary key default gen_random_uuid(),
  order_number               text not null unique,
  user_id                    uuid not null references public.profiles(id) on delete restrict,
  status                     order_status not null default 'pending',
  payment_status             payment_status not null default 'unpaid',
  subtotal                   numeric(10,2) not null default 0,
  discount_amount            numeric(10,2) not null default 0,
  shipping_amount            numeric(10,2) not null default 0,
  tax_amount                 numeric(10,2) not null default 0,
  total_amount               numeric(10,2) not null default 0,
  currency                   text not null default 'INR',
  discount_id                uuid references public.discounts(id) on delete set null,
  shipping_address_id        uuid references public.addresses(id) on delete set null,
  billing_address_id         uuid references public.addresses(id) on delete set null,
  stripe_checkout_session_id text,
  stripe_payment_intent_id   text,
  customer_notes             text,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_order_number on public.orders(order_number);

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Human-friendly order numbers, e.g. BN-20260620-00001
create sequence if not exists public.order_number_seq;

create or replace function public.generate_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := 'BN-' || to_char(now(), 'YYYYMMDD') || '-' ||
      lpad(nextval('public.order_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger trg_orders_generate_number
  before insert on public.orders
  for each row execute function public.generate_order_number();

-- ---------------------------------------------------------
-- 14. ORDER ITEMS (price/name snapshots so history is immutable
--      even if the product is later edited or deleted)
-- ---------------------------------------------------------
create table public.order_items (
  id                          uuid primary key default gen_random_uuid(),
  order_id                    uuid not null references public.orders(id) on delete cascade,
  product_id                  uuid not null references public.products(id) on delete restrict,
  variant_id                  uuid not null references public.product_variants(id) on delete restrict,
  product_name_snapshot       text not null,
  variant_details_snapshot    jsonb not null default '{}'::jsonb,
  unit_price                  numeric(10,2) not null check (unit_price >= 0),
  quantity                    int not null check (quantity > 0),
  subtotal                    numeric(10,2) not null check (subtotal >= 0),
  created_at                  timestamptz not null default now()
);

create index idx_order_items_order_id on public.order_items(order_id);
create index idx_order_items_product_id on public.order_items(product_id);

-- Now that order_items exists, wire up the deferred FK on reviews
alter table public.reviews
  add constraint fk_reviews_order_item
  foreign key (order_item_id) references public.order_items(id) on delete set null;

-- ---------------------------------------------------------
-- 15. ORDER STATUS HISTORY (admin audit trail)
-- ---------------------------------------------------------
create table public.order_status_history (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  status      order_status not null,
  changed_by  uuid references public.profiles(id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);

create index idx_status_history_order_id on public.order_status_history(order_id);

-- ---------------------------------------------------------
-- 16. PAYMENT TRANSACTIONS (Stripe event/audit log)
-- ---------------------------------------------------------
create table public.payment_transactions (
  id                       uuid primary key default gen_random_uuid(),
  order_id                 uuid not null references public.orders(id) on delete cascade,
  stripe_payment_intent_id text,
  amount                   numeric(10,2) not null,
  currency                 text not null default 'INR',
  status                   text not null,
  raw_event                jsonb,
  created_at               timestamptz not null default now()
);

create index idx_payment_tx_order_id on public.payment_transactions(order_id);

-- ---------------------------------------------------------
-- 17. NEWSLETTER SUBSCRIBERS
-- ---------------------------------------------------------
create table public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  is_active       boolean not null default true,
  subscribed_at   timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- ---------------------------------------------------------
-- 18. CONTACT MESSAGES
-- ---------------------------------------------------------
create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  status      contact_status not null default 'new',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 19. STOCK HELPER — called from the checkout API route (Phase 3)
--     after a Stripe payment is confirmed.
-- ---------------------------------------------------------
create or replace function public.decrement_variant_stock(p_variant_id uuid, p_quantity int)
returns void
language plpgsql
security definer
as $$
begin
  update public.product_variants
  set stock_quantity = stock_quantity - p_quantity
  where id = p_variant_id and stock_quantity >= p_quantity;

  if not found then
    raise exception 'Insufficient stock for variant %', p_variant_id;
  end if;
end;
$$;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.cart_items enable row level security;
alter table public.discounts enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;

-- Helper: is the current JWT an admin / super_admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

-- profiles
create policy "Profiles are viewable by owner or admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- addresses
create policy "Users manage own addresses"
  on public.addresses for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id);

-- categories (public read, admin write)
create policy "Categories are publicly readable"
  on public.categories for select using (true);
create policy "Only admins insert categories"
  on public.categories for insert with check (public.is_admin());
create policy "Only admins update categories"
  on public.categories for update using (public.is_admin());
create policy "Only admins delete categories"
  on public.categories for delete using (public.is_admin());

-- products (public read active rows, admin full access)
create policy "Active products are publicly readable"
  on public.products for select using (is_active = true or public.is_admin());
create policy "Only admins insert products"
  on public.products for insert with check (public.is_admin());
create policy "Only admins update products"
  on public.products for update using (public.is_admin());
create policy "Only admins delete products"
  on public.products for delete using (public.is_admin());

-- variants & images mirror the product policy
create policy "Variants are publicly readable"
  on public.product_variants for select using (true);
create policy "Only admins insert variants"
  on public.product_variants for insert with check (public.is_admin());
create policy "Only admins update variants"
  on public.product_variants for update using (public.is_admin());
create policy "Only admins delete variants"
  on public.product_variants for delete using (public.is_admin());

create policy "Images are publicly readable"
  on public.product_images for select using (true);
create policy "Only admins manage images"
  on public.product_images for all using (public.is_admin()) with check (public.is_admin());

-- reviews
create policy "Reviews are publicly readable"
  on public.reviews for select using (true);
create policy "Authenticated users create own reviews"
  on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users update own reviews"
  on public.reviews for update using (auth.uid() = user_id or public.is_admin());
create policy "Users delete own reviews"
  on public.reviews for delete using (auth.uid() = user_id or public.is_admin());

-- wishlists
create policy "Users manage own wishlist"
  on public.wishlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- cart items
create policy "Users manage own cart"
  on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- discounts (active codes are readable, admin manages)
create policy "Active discounts are readable"
  on public.discounts for select using (is_active = true or public.is_admin());
create policy "Only admins insert discounts"
  on public.discounts for insert with check (public.is_admin());
create policy "Only admins update discounts"
  on public.discounts for update using (public.is_admin());
create policy "Only admins delete discounts"
  on public.discounts for delete using (public.is_admin());

-- orders
create policy "Users view own orders"
  on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "Users create own orders"
  on public.orders for insert with check (auth.uid() = user_id);
create policy "Owner or admin can update an order"
  on public.orders for update using (public.is_admin() or auth.uid() = user_id);

-- order items
create policy "Users view own order items"
  on public.order_items for select
  using (
    public.is_admin() or
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy "Users insert own order items"
  on public.order_items for insert
  with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- order status history
create policy "View own order history or admin"
  on public.order_status_history for select
  using (
    public.is_admin() or
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy "Only admins write order history"
  on public.order_status_history for insert with check (public.is_admin());

-- payment transactions (admin / service-role only — written by the Stripe webhook)
create policy "Only admins view payment transactions"
  on public.payment_transactions for select using (public.is_admin());

-- newsletter (public can subscribe, admin reads the list)
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert with check (true);
create policy "Only admins read subscribers"
  on public.newsletter_subscribers for select using (public.is_admin());

-- contact messages (public can send, admin manages inbox)
create policy "Anyone can send a contact message"
  on public.contact_messages for insert with check (true);
create policy "Only admins read contact messages"
  on public.contact_messages for select using (public.is_admin());
create policy "Only admins update contact messages"
  on public.contact_messages for update using (public.is_admin());
