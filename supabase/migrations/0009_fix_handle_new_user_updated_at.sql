-- =========================================================
-- BuyNest — Migration 0009
-- File: supabase/migrations/0009_fix_handle_new_user_updated_at.sql
--
-- Fixes a signup-time 500 confirmed live via Supabase's Auth logs:
--   "null value in column "updated_at" of relation "profiles"
--   violates not-null constraint"
--
-- The trigger that auto-creates a profiles row for every new
-- auth.users signup (see 0001_init.sql, handle_new_user()) only ever
-- inserted id/full_name/avatar_url, relying on the column default to
-- fill created_at/updated_at. On this project's actual database that
-- default isn't present on updated_at, so every signup through this
-- trigger fails — including the anonymous sign-in guest checkout uses.
-- This makes the insert self-sufficient by setting both timestamps
-- explicitly instead of depending on a column default that may or may
-- not exist.
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, created_at, updated_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    now(),
    now()
  );
  return new;
end;
$$;
