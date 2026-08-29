-- =========================================================
-- BuyNest — Migration 0012
-- File: supabase/migrations/0012_add_kit_contents.sql
--
-- Adds an optional "what's included" list for kit/bundle products
-- (e.g. an Arduino kit with many small pieces) that don't fit naturally
-- into the free-text description. One item per line, admin-entered;
-- null/empty means the product has no such list and the section simply
-- doesn't render on the product page.
-- =========================================================

alter table public.products add column if not exists kit_contents text;
