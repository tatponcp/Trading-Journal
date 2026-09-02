-- Adds broker_ticket so a CSV re-import can UPDATE a trade it already
-- imported (matched by ticket/order id) instead of creating a duplicate.
-- Run this once in the Supabase SQL editor for a project created before
-- this column existed. Safe to re-run (also fixes projects that already
-- ran an earlier, buggy version of this migration — see note below).

alter table public.trades
  add column if not exists broker_ticket text;

-- IMPORTANT: this must be a plain (non-partial) unique constraint, not a
-- partial unique index. Postgres treats every NULL broker_ticket as
-- distinct from every other one already, so trades without a ticket are
-- never blocked by this — but a *partial* index (e.g. "where broker_ticket
-- is not null") cannot be used as an upsert ON CONFLICT target unless the
-- exact same predicate is repeated in the conflict clause, which Supabase's
-- JS client has no way to do. Using a plain constraint avoids that entirely.
drop index if exists public.trades_user_ticket_unique;
alter table public.trades
  drop constraint if exists trades_user_ticket_unique;
alter table public.trades
  add constraint trades_user_ticket_unique unique (user_id, broker_ticket);
