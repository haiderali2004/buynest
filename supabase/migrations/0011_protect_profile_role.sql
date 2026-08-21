-- =========================================================
-- BuyNest — Migration 0011
-- File: supabase/migrations/0011_protect_profile_role.sql
--
-- Closes a real privilege-escalation hole found during a security
-- audit: the "Profiles are editable by owner" UPDATE policy (0001)
-- only checks that a user owns the row (auth.uid() = id) — it never
-- restricts which columns they're allowed to change. Since `role`
-- lives on the same row, any signed-in user could call Supabase's
-- REST API directly (PATCH /rest/v1/profiles?id=eq.<their-id> with
-- {"role":"admin"}) and RLS would allow it, self-promoting to admin.
--
-- Fixed with a trigger rather than a WITH CHECK clause, since a
-- WITH CHECK can't cleanly compare against the row's previous value.
-- The trigger silently reverts any attempted role change back to
-- whatever it already was — UNLESS either:
--   1. The change is being made by someone who is *already* an admin
--      (auth.uid() + is_admin() both true), or
--   2. There's no auth.uid() at all — meaning the write is coming
--      through a direct database connection (this app's own
--      server-side Prisma code, or scripts/promote-admin.ts), not
--      through the public API. That path is already gated by a
--      secret (DATABASE_URL) that only trusted operators have, so it
--      stays exempt on purpose — this fix specifically closes the
--      public-facing hole, not the operator-trusted one.
-- =========================================================

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() and new.role is distinct from old.role then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();
