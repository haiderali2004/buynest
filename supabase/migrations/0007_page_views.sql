-- =========================================================
-- BuyNest — Migration 0007
-- File: supabase/migrations/0007_page_views.sql
--
-- Lightweight, privacy-conscious page-view tracking, built on the
-- database this app already has rather than requiring a new account with
-- a tool like Plausible or GA4. No IP address, no cookie, no session
-- stitching, no device/browser fingerprinting — just a path, an optional
-- referrer, and a timestamp. That makes this enough for "what are our
-- most-viewed pages this week", but genuinely not a substitute for a
-- real analytics tool if you want funnels, bounce rate, geography, or
-- real-time dashboards — those need a dedicated product, not something
-- reasonable to hand-roll here.
-- =========================================================

create table public.page_views (
  id          bigserial primary key,
  path        text not null,
  referrer    text,
  created_at  timestamptz not null default now()
);

create index idx_page_views_created_at on public.page_views(created_at);
create index idx_page_views_path on public.page_views(path);
