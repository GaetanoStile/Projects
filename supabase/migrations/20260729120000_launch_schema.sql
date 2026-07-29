-- Couples Game launch schema: cards, game_sessions, RLS, indexes, creator-name policy
-- Idempotent where possible (IF NOT EXISTS / DROP POLICY IF EXISTS)

-- ---------------------------------------------------------------------------
-- cards
-- ---------------------------------------------------------------------------
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id),
  title text not null,
  description text not null,
  deck text not null check (deck in ('A','B','C','D','black')),
  player_color text not null check (player_color in ('red','blue','any','neutral')),
  is_swap_card boolean default false,
  is_custom boolean default false,
  is_enabled boolean default true,
  is_favorite boolean default false,
  intensity text check (intensity in ('soft', 'medium', 'hot', 'wild')) default 'medium',
  tags text[] default '{}',
  image_url text,
  visibility text check (visibility in ('private', 'public')) default 'private',
  created_at timestamptz default now()
);

-- Ensure columns exist on older partial tables
alter table public.cards add column if not exists is_favorite boolean default false;
alter table public.cards add column if not exists intensity text default 'medium';
alter table public.cards add column if not exists tags text[] default '{}';
alter table public.cards add column if not exists image_url text;
alter table public.cards add column if not exists visibility text default 'private';

alter table public.cards enable row level security;

drop policy if exists "Everyone can read global cards" on public.cards;
create policy "Everyone can read global cards"
  on public.cards for select
  using (owner_id is null);

drop policy if exists "Users can read own cards" on public.cards;
create policy "Users can read own cards"
  on public.cards for select
  using (owner_id = auth.uid());

drop policy if exists "Users can insert own cards" on public.cards;
create policy "Users can insert own cards"
  on public.cards for insert
  with check (owner_id = auth.uid());

drop policy if exists "Users can update own cards" on public.cards;
create policy "Users can update own cards"
  on public.cards for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "Users can delete own cards" on public.cards;
create policy "Users can delete own cards"
  on public.cards for delete
  using (owner_id = auth.uid());

drop policy if exists "Admins can manage global cards" on public.cards;
create policy "Admins can manage global cards"
  on public.cards for all
  using (
    owner_id is null and
    exists (
      select 1 from public.users_profile
      where id = auth.uid() and is_admin = true
    )
  )
  with check (
    owner_id is null and
    exists (
      select 1 from public.users_profile
      where id = auth.uid() and is_admin = true
    )
  );

drop policy if exists "Anyone can read public user cards" on public.cards;
create policy "Anyone can read public user cards"
  on public.cards for select
  using (visibility = 'public' and owner_id is not null);

create index if not exists idx_cards_owner_id on public.cards(owner_id);
create index if not exists idx_cards_global on public.cards(owner_id) where owner_id is null;
create index if not exists idx_cards_deck on public.cards(deck);
create index if not exists idx_cards_intensity on public.cards(intensity);
create index if not exists idx_cards_tags on public.cards using gin(tags);
create index if not exists idx_cards_visibility_public
  on public.cards(visibility)
  where visibility = 'public' and owner_id is not null;

-- ---------------------------------------------------------------------------
-- game_sessions
-- ---------------------------------------------------------------------------
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  player_red_name text not null default '',
  player_blue_name text not null default '',
  current_player text not null default 'red',
  starting_player text,
  used_card_ids text[] default '{}',
  swap_count_red integer default 0,
  swap_count_blue integer default 0,
  swap_inventory_red integer default 0,
  swap_inventory_blue integer default 0,
  black_unlocked_red boolean default false,
  black_unlocked_blue boolean default false,
  -- App values: both | red_only | blue_only | none
  selected_mode text default 'both',
  session_disabled_card_ids text[] default '{}',
  is_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.game_sessions enable row level security;

drop policy if exists "Users can manage own sessions" on public.game_sessions;
create policy "Users can manage own sessions"
  on public.game_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_game_sessions_user_active
  on public.game_sessions(user_id, updated_at desc)
  where is_completed = false;

-- ---------------------------------------------------------------------------
-- users_profile RLS (may already exist)
-- ---------------------------------------------------------------------------
alter table public.users_profile enable row level security;

alter table public.users_profile add column if not exists email text;
alter table public.users_profile add column if not exists plan_tier text default 'free';
alter table public.users_profile add column if not exists is_admin boolean default false;
alter table public.users_profile add column if not exists display_name text;

drop policy if exists "Users can read own profile" on public.users_profile;
create policy "Users can read own profile"
  on public.users_profile for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users_profile;
create policy "Users can update own profile"
  on public.users_profile for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users_profile;
create policy "Users can insert own profile"
  on public.users_profile for insert
  with check (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.users_profile;
create policy "Admins can read all profiles"
  on public.users_profile for select
  using (
    exists (
      select 1 from public.users_profile
      where id = auth.uid() and is_admin = true
    )
  );

-- Library: authenticated users can read display names of public-card creators
drop policy if exists "Authenticated can read public card creator names" on public.users_profile;
create policy "Authenticated can read public card creator names"
  on public.users_profile for select
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.cards c
      where c.owner_id = users_profile.id
        and c.visibility = 'public'
        and c.owner_id is not null
    )
  );

-- ---------------------------------------------------------------------------
-- user_favorite_cards RLS
-- ---------------------------------------------------------------------------
create table if not exists public.user_favorite_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id text not null,
  created_at timestamptz default now(),
  unique(user_id, card_id)
);

alter table public.user_favorite_cards enable row level security;

drop policy if exists "Users can manage own favorites" on public.user_favorite_cards;
create policy "Users can manage own favorites"
  on public.user_favorite_cards
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_user_favorite_cards_user
  on public.user_favorite_cards(user_id);

-- ---------------------------------------------------------------------------
-- Grant admin to primary account (if present)
-- ---------------------------------------------------------------------------
update public.users_profile
set is_admin = true
where id in (
  select id from auth.users
  where lower(email) = lower('guy.stile@gmail.com')
);
