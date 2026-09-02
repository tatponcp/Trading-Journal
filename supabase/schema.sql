-- Trading Journal schema for Supabase (Postgres)
-- Run this once in the Supabase SQL editor for a new project.

create extension if not exists "pgcrypto";

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trade_date date not null,
  symbol text not null default 'XAUUSD',
  side text not null check (side in ('long', 'short')),
  entry_price numeric not null,
  exit_price numeric,
  stop_loss numeric,
  take_profit numeric,
  lot_size numeric not null default 0,
  pnl numeric not null default 0,
  notes text,
  broker_ticket text,
  created_at timestamptz not null default now()
);

create index if not exists trades_user_date_idx
  on public.trades (user_id, trade_date);

-- Lets a CSV re-import update an already-imported trade (matched by its
-- broker ticket/order id) instead of creating a duplicate row.
create unique index if not exists trades_user_ticket_unique
  on public.trades (user_id, broker_ticket)
  where broker_ticket is not null;

create table if not exists public.account_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  starting_balance numeric not null default 10000,
  profit_target numeric not null default 1000,
  currency text not null default 'USD',
  updated_at timestamptz not null default now()
);

-- Row Level Security: every user only ever sees their own rows.
alter table public.trades enable row level security;
alter table public.account_settings enable row level security;

create policy "trades_select_own" on public.trades
  for select using (auth.uid() = user_id);
create policy "trades_insert_own" on public.trades
  for insert with check (auth.uid() = user_id);
create policy "trades_update_own" on public.trades
  for update using (auth.uid() = user_id);
create policy "trades_delete_own" on public.trades
  for delete using (auth.uid() = user_id);

create policy "settings_select_own" on public.account_settings
  for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.account_settings
  for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.account_settings
  for update using (auth.uid() = user_id);

-- Automatically create a default settings row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.account_settings (user_id, starting_balance, profit_target, currency)
  values (new.id, 10000, 1000, 'USD')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
