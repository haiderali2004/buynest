-- =========================================================
-- BuyNest — Migration 0004
-- File: supabase/migrations/0004_shipment_tracking.sql
--
-- Replaces "tracking number as a free-text note" with real structured
-- fields, so the customer-facing order page can show an actual clickable
-- tracking link instead of admin having to remember to type one into a
-- note field consistently. This is NOT a live carrier-tracking
-- integration (no carrier API calls happen) — it's just a proper place to
-- record the carrier, tracking number, and tracking URL admin already has
-- once a package ships.
-- =========================================================

alter table public.orders add column carrier text;
alter table public.orders add column tracking_number text;
alter table public.orders add column tracking_url text;
