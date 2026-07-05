-- =========================================================
-- BuyNest — Migration 0003
-- File: supabase/migrations/0003_order_email.sql
--
-- Adds a customer_email column to orders. This was a real gap: the
-- checkout form already collects an email (for the old Stripe receipt_email
-- field), but it was never persisted anywhere — Supabase Auth owns the
-- user's email in auth.users, which this app deliberately doesn't model in
-- Prisma. Without a queryable email on the order itself, sending order
-- confirmation / status update emails isn't possible without an extra
-- Admin API round-trip per email. Nullable because existing orders (if
-- any) predate this column and there's no way to backfill them.
-- =========================================================

alter table public.orders add column customer_email text;
