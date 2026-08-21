-- =========================================================
-- BuyNest — Migration 0010
-- File: supabase/migrations/0010_fix_missing_rls.sql
--
-- Fixes 4 tables flagged CRITICAL by Supabase's own security advisor
-- ("RLS Disabled in Public"): returns, return_items, rate_limit_events,
-- page_views. With RLS off, the public anon API key — which is meant to
-- be embedded in the browser — could read/write these tables directly
-- through Supabase's REST API, bypassing this app's own authorization
-- logic entirely.
--
-- returns/return_items already had correct policies written in
-- 0002_payments_and_returns.sql, but the live database evidently never
-- picked them up (same root cause as migration 0009's finding: this
-- project's actual database appears to have been provisioned in a way
-- that skipped some of these .sql files). Policies are dropped-if-exist
-- and recreated here so this migration is safe to run regardless of
-- whatever partial state is currently live.
--
-- rate_limit_events and page_views never had RLS-enabling code written
-- for them at all — a genuine gap, not just a drift issue. Neither
-- table has any legitimate reason to be queried directly by a
-- customer's browser (this app only ever touches them server-side, via
-- Prisma's direct database connection, which isn't subject to RLS) —
-- so enabling RLS with zero permissive policies is the correct fix:
-- default-deny for the public API, unaffected for the app itself.
-- =========================================================

alter table public.returns enable row level security;
alter table public.return_items enable row level security;
alter table public.rate_limit_events enable row level security;
alter table public.page_views enable row level security;

drop policy if exists "Users view own returns or admin" on public.returns;
create policy "Users view own returns or admin"
  on public.returns for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users create own return requests" on public.returns;
create policy "Users create own return requests"
  on public.returns for insert
  with check (auth.uid() = user_id);

drop policy if exists "Only admins update returns" on public.returns;
create policy "Only admins update returns"
  on public.returns for update
  using (public.is_admin());

drop policy if exists "View return items via parent return" on public.return_items;
create policy "View return items via parent return"
  on public.return_items for select
  using (
    public.is_admin() or
    exists (select 1 from public.returns r where r.id = return_id and r.user_id = auth.uid())
  );

drop policy if exists "Users insert return items for own return" on public.return_items;
create policy "Users insert return items for own return"
  on public.return_items for insert
  with check (
    exists (select 1 from public.returns r where r.id = return_id and r.user_id = auth.uid())
  );

drop policy if exists "Only admins update return items" on public.return_items;
create policy "Only admins update return items"
  on public.return_items for update
  using (public.is_admin());
