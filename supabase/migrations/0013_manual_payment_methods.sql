-- =========================================================
-- BuyNest — Migration 0013
-- File: supabase/migrations/0013_manual_payment_methods.sql
--
-- Adds Cash on Delivery and a manual JazzCash/EasyPaisa flow alongside
-- the existing Safepay card checkout: at checkout the customer picks a
-- payment method; card goes through Safepay exactly as before, COD
-- places the order unpaid for cash-on-delivery, and manual_wallet sends
-- the customer to a page showing the owner's wallet number + amount
-- due, where they upload a screenshot as proof — an admin then reviews
-- it and confirms payment manually (no live JazzCash/EasyPaisa API
-- integration; Safepay support confirmed those payment rails exist on
-- their platform but nothing was self-service-configurable in the
-- dashboard, so this is the pragmatic manual-verification alternative
-- used by most small Pakistani stores).
--
-- NOTE ON VERIFICATION: same caveat as 0008 — the storage bucket
-- portion couldn't be run against a real instance to confirm it applies
-- cleanly, since that schema only exists on an actual Supabase project.
-- =========================================================

create type public.payment_method as enum ('card', 'cod', 'manual_wallet');

alter table public.orders
  add column if not exists payment_method public.payment_method not null default 'card',
  add column if not exists payment_proof_url text;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

-- Any signed-in session (a guest checkout's anonymous sign-in counts)
-- can upload — this runs right after their own order is created, before
-- they'd have any reason to have signed out. Not restricted to the
-- order's owner specifically, since matching that here would need a
-- database lookup this policy can't cleanly express; the object path is
-- an unguessable random id either way; and the exact same trust model
-- already covers admin-uploaded product images in this project.
create policy "Signed-in users can upload payment proofs"
  on storage.objects for insert
  with check (bucket_id = 'payment-proofs' and auth.uid() is not null);
