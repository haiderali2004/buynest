-- =========================================================
-- BuyNest — Migration 0005
-- File: supabase/migrations/0005_stock_reservation.sql
--
-- Closes a previously-disclosed gap: stock used to be decremented only at
-- payment confirmation, which left a window where two concurrent
-- checkouts could both be charged for the same last unit. From this
-- migration on, stock is decremented atomically at checkout *creation*
-- (inside the same transaction as the order itself — if decrement_variant_stock
-- raises because there isn't enough stock, the whole order creation rolls
-- back, so a customer is never even offered a checkout session for stock
-- that isn't really there).
--
-- That reservation needs to be released if the customer never pays —
-- reservation_expires_at + release_expired_reservations() is the
-- mechanism for that. The application calls the release function lazily
-- (right before pricing a new checkout attempt) rather than relying on a
-- cron job, so it works correctly even with no scheduler configured —
-- though wiring a real cron to call it periodically is better for typical
-- abandoned-cart timing. See app/api/cron/release-reservations/route.ts.
-- =========================================================

alter table public.orders add column reservation_expires_at timestamptz;

create or replace function public.release_expired_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_order record;
  released_count integer := 0;
begin
  for expired_order in
    select id
    from public.orders
    where status = 'pending'
      and payment_status = 'unpaid'
      and reservation_expires_at is not null
      and reservation_expires_at < now()
  loop
    -- Restore stock for every item on this abandoned order.
    update public.product_variants pv
    set stock_quantity = pv.stock_quantity + oi.quantity
    from public.order_items oi
    where oi.order_id = expired_order.id
      and oi.variant_id = pv.id;

    update public.orders
    set status = 'cancelled'
    where id = expired_order.id;

    insert into public.order_status_history (order_id, status, note)
    values (expired_order.id, 'cancelled', 'Reservation expired — payment was never completed.');

    released_count := released_count + 1;
  end loop;

  return released_count;
end;
$$;
