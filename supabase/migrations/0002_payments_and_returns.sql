-- =========================================================
-- BuyNest — Migration 0002
-- File: supabase/migrations/0002_payments_and_returns.sql
--
-- Three independent changes bundled into one migration:
--   1. Currency default: INR -> PKR (the store is Pakistan-based).
--   2. Swap Stripe-specific columns for a payment-provider-agnostic
--      shape (the store now uses Safepay — see lib/payments/safepay.ts —
--      but this keeps the schema from being locked to a single gateway).
--   3. A "returns" feature: customers can request a return on specific
--      order items; admins approve/reject, mark items received, and
--      record the refund.
-- =========================================================

-- ---------------------------------------------------------
-- 1. Currency defaults
-- ---------------------------------------------------------
alter table public.products alter column currency set default 'PKR';
alter table public.orders alter column currency set default 'PKR';
alter table public.payment_transactions alter column currency set default 'PKR';

-- ---------------------------------------------------------
-- 2. Provider-agnostic payment columns
-- ---------------------------------------------------------
alter table public.orders drop column if exists stripe_checkout_session_id;
alter table public.orders rename column stripe_payment_intent_id to safepay_tracker_token;

create index idx_orders_safepay_tracker_token on public.orders(safepay_tracker_token);

alter table public.payment_transactions rename column stripe_payment_intent_id to provider_reference;
alter table public.payment_transactions add column provider text not null default 'safepay';

-- ---------------------------------------------------------
-- 3. Returns
-- ---------------------------------------------------------
create type return_status as enum (
  'requested', 'approved', 'rejected', 'item_received', 'refunded', 'cancelled'
);

create table public.returns (
  id                         uuid primary key default gen_random_uuid(),
  order_id                   uuid not null references public.orders(id) on delete restrict,
  user_id                    uuid not null references public.profiles(id) on delete restrict,
  status                     return_status not null default 'requested',
  reason                     text not null,
  customer_note              text,
  admin_note                 text,
  refund_amount              numeric(10,2),
  provider_refund_reference  text,
  requested_at               timestamptz not null default now(),
  processed_at               timestamptz,
  refunded_at                timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create index idx_returns_order_id on public.returns(order_id);
create index idx_returns_user_id on public.returns(user_id);

create trigger trg_returns_updated_at
  before update on public.returns
  for each row execute function public.set_updated_at();

create table public.return_items (
  id             uuid primary key default gen_random_uuid(),
  return_id      uuid not null references public.returns(id) on delete cascade,
  order_item_id  uuid not null references public.order_items(id) on delete restrict,
  quantity       int not null check (quantity > 0),
  restocked      boolean not null default false,
  created_at     timestamptz not null default now(),
  unique (return_id, order_item_id)
);

create index idx_return_items_return_id on public.return_items(return_id);
create index idx_return_items_order_item_id on public.return_items(order_item_id);

-- RLS
alter table public.returns enable row level security;
alter table public.return_items enable row level security;

create policy "Users view own returns or admin"
  on public.returns for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users create own return requests"
  on public.returns for insert
  with check (auth.uid() = user_id);

create policy "Only admins update returns"
  on public.returns for update
  using (public.is_admin());

create policy "View return items via parent return"
  on public.return_items for select
  using (
    public.is_admin() or
    exists (select 1 from public.returns r where r.id = return_id and r.user_id = auth.uid())
  );

create policy "Users insert return items for own return"
  on public.return_items for insert
  with check (
    exists (select 1 from public.returns r where r.id = return_id and r.user_id = auth.uid())
  );

create policy "Only admins update return items"
  on public.return_items for update
  using (public.is_admin());
