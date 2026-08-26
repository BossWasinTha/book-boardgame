-- Books & Boardgame — schema
-- Run this once in the Supabase SQL editor, then run seed.sql.

create extension if not exists "pgcrypto";

-- ── members ─────────────────────────────────────────────────────────
create table members (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text not null,
  unit          text,
  photo_url     text,
  signup_ip     inet,
  created_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index members_signup_ip_idx on members (signup_ip) where deleted_at is null;

-- ── items (books + board games) ────────────────────────────────────
-- Availability is derived from `rentals`, not stored here — see
-- lib/db/items.ts. `condition` only tracks the admin-controlled
-- shelf/repair state that isn't implied by an active rental.
create table items (
  id            text primary key,
  title         text not null,
  item_type     text not null check (item_type in ('หนังสือ','บอร์ดเกม')),
  author        text,
  genre         text,
  subtitle      text not null,             -- e.g. '2–8 คน · 15–30 นาที' or 'Matt Haig · นิยาย'
  short_label   text not null,             -- e.g. '2–8 คน' or 'Matt Haig'
  cover_color   text not null,
  cover_ink     text not null,
  description   text not null default '',
  facts         jsonb not null default '[]', -- [{ "k": "ผู้เล่น", "v": "2–8 คน" }, ...]
  tags          text[] not null default '{}',
  deposit       integer not null,
  rate_per_day  integer not null,
  condition     text not null default 'shelf' check (condition in ('shelf','repair')),
  is_custom     boolean not null default false,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- ── rentals ─────────────────────────────────────────────────────────
create table rentals (
  id            uuid primary key default gen_random_uuid(),
  item_id       text not null references items(id),
  member_id     uuid not null references members(id),
  rented_on     date not null default current_date,
  due_on        date not null,
  returned_on   date,
  pickup_slot   text not null check (pickup_slot in ('เช้า','เย็น')),
  return_slot   text not null check (return_slot in ('เช้า','เย็น')),
  deposit_thb   integer not null,
  rent_thb      integer not null,
  total_thb     integer not null,
  payment_state text not null default 'awaiting_slip'
    check (payment_state in ('awaiting_slip','confirmed','refunded')),
  created_at    timestamptz not null default now()
);
create index rentals_item_open_idx on rentals (item_id) where returned_on is null;
create index rentals_member_idx on rentals (member_id);

-- ── admin PIN rate limiting (server-side, per README) ──────────────
create table admin_lockouts (
  ip            inet primary key,
  attempts      int not null default 0,
  locked_until  timestamptz
);

-- ── row level security ──────────────────────────────────────────────
-- All writes happen through API routes using the service-role key,
-- which bypasses RLS. The anon key is only used client-side for
-- read-only Realtime subscriptions, so anon gets SELECT-only access
-- to non-deleted rows and nothing on admin_lockouts.
alter table members enable row level security;
alter table items enable row level security;
alter table rentals enable row level security;
alter table admin_lockouts enable row level security;

create policy "members are readable" on members
  for select using (deleted_at is null);
create policy "items are readable" on items
  for select using (deleted_at is null);
create policy "rentals are readable" on rentals
  for select using (true);

-- ── realtime ─────────────────────────────────────────────────────────
alter publication supabase_realtime add table members, items, rentals;

-- ── storage (profile photos) ────────────────────────────────────────
-- Public read (photos are shown in the admin dashboard); all writes go
-- through /api/members/photo using the service-role key.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
