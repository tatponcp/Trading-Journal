-- Adds broker_ticket so a CSV re-import can UPDATE a trade it already
-- imported (matched by ticket/order id) instead of creating a duplicate.
-- Run this once in the Supabase SQL editor for a project created before
-- this column existed. Safe to re-run.

alter table public.trades
  add column if not exists broker_ticket text;

create unique index if not exists trades_user_ticket_unique
  on public.trades (user_id, broker_ticket)
  where broker_ticket is not null;
