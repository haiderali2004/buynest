-- =========================================================
-- BuyNest — Migration 0008
-- File: supabase/migrations/0008_product_image_storage.sql
--
-- Creates a public Storage bucket for product/category images, so admin
-- can upload a file directly instead of only being able to paste a URL.
-- Uses Supabase's standard storage.buckets / storage.objects RLS pattern.
--
-- NOTE ON VERIFICATION: this follows Supabase's documented storage setup
-- conventions, but — unlike every other migration in this project — it
-- couldn't be run against a real instance to confirm it applies cleanly,
-- since the storage schema only exists on an actual Supabase project,
-- not a plain local Postgres install. Run this one in the Supabase SQL
-- editor and confirm the bucket appears under Storage before relying on
-- the upload feature.
-- =========================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read access to product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());
