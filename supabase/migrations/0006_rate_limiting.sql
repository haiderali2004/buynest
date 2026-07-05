-- =========================================================
-- BuyNest — Migration 0006
-- File: supabase/migrations/0006_rate_limiting.sql
--
-- A simple database-backed rate limiter for public-facing endpoints
-- (checkout, contact form, newsletter signup, discount-code validation)
-- that doesn't depend on a new third-party service (Redis/Upstash) —
-- this app already has Postgres, so it uses that. A sliding window over
-- this table costs one extra query per protected request; that's a
-- reasonable trade for a store at this scale, and it's an isolated
-- enough mechanism (see lib/rate-limit.ts) to swap for Redis later if
-- traffic ever makes that worth it.
-- =========================================================

create table public.rate_limit_events (
  id bigserial primary key,
  bucket_key text not null,
  created_at timestamptz not null default now()
);

create index idx_rate_limit_bucket_created on public.rate_limit_events(bucket_key, created_at);

-- Not required for correctness (old rows just stop mattering once they
-- fall out of any window), but keeps the table from growing forever.
-- Called opportunistically from application code rather than on a
-- schedule, for the same "doesn't depend on a cron" reasoning as
-- migration 0005's reservation release.
create or replace function public.cleanup_old_rate_limit_events()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.rate_limit_events where created_at < now() - interval '1 day';
$$;
