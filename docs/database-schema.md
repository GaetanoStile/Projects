# Database Schema

This document describes the Supabase database schema for the Couples Game V3.

## Tables

### `public.users_profile`

App-specific user information, linked to Supabase Auth users.

```sql
create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  plan_tier text default 'free',
  is_admin boolean default false,
  created_at timestamptz default now()
);
```

**Fields:**
- `id`: UUID, primary key, references `auth.users(id)`
- `email`: Email address copied from Supabase Auth for convenient app reads
- `display_name`: Optional display name for the user
- `plan_tier`: Billing / feature tier (`free` by default)
- `is_admin`: Boolean flag indicating admin privileges
- `created_at`: Timestamp of profile creation

**RLS Policies:**
- Users can read/write their own row
- Admins can read all rows

### `public.cards`

Stores both global cards (available to all users) and user custom cards.

```sql
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id),            -- null for global cards
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
  created_at timestamptz default now()
);
```

**Fields:**
- `id`: UUID, primary key
- `owner_id`: UUID, nullable. If `null`, the card is global. If set, it's a user's custom card.
- `title`: Card title (required)
- `description`: Card description (required)
- `deck`: Deck letter - must be one of: 'A', 'B', 'C', 'D', 'black'
- `player_color`: Player color restriction - must be one of: 'red', 'blue', 'any', 'neutral'
- `is_swap_card`: Boolean indicating if this is a swap card
- `is_custom`: Boolean indicating if this is a custom card (always true for user cards)
- `is_enabled`: Boolean indicating if the card is enabled (defaults to true). Disabled cards won't appear in gameplay.
- `is_favorite`: Boolean indicating if the card is favorited (defaults to false)
- `intensity`: Intensity level - must be one of: 'soft', 'medium', 'hot', 'wild' (defaults to 'medium')
- `tags`: Array of tags (defaults to empty array). Valid tags: 'kissing', 'massage', 'teasing', 'oral', 'toys', 'domination', 'submission', 'romantic', 'roleplay'
- `image_url`: Optional image URL (data URL or Supabase Storage URL)
- `created_at`: Timestamp of card creation

**Migration SQL (for existing databases):**

```sql
-- Add account fields required by the app profile model
alter table public.users_profile
add column if not exists email text,
add column if not exists plan_tier text default 'free';

-- Backfill email from Supabase Auth users
update public.users_profile up
set email = au.email
from auth.users au
where up.id = au.id
  and (up.email is null or up.email = '');

-- Backfill plan tier for older rows
update public.users_profile
set plan_tier = 'free'
where plan_tier is null;

-- Add new columns for metadata
ALTER TABLE public.cards
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS intensity text CHECK (intensity IN ('soft', 'medium', 'hot', 'wild')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
```

**RLS Policies:**
- Global cards (`owner_id is null`): Readable by everyone
- Custom cards (`owner_id = auth.uid()`): Readable and writable only by the owner
- Admins can create/update/delete global cards

## Admin Setup

To grant admin privileges to users, update the `users_profile` table:

```sql
-- Set admin status for specific emails
update public.users_profile
set is_admin = true
where id in (
  select id from auth.users
  where email in ('me@example.com', 'partner@example.com')
);
```

Alternatively, you can set admin status via the `VITE_ADMIN_EMAILS` environment variable (or legacy `ADMIN_EMAILS`), which is checked during authentication.

## Indexes (Recommended)

For better query performance, consider adding indexes:

```sql
-- Index for fetching user's custom cards
create index if not exists idx_cards_owner_id on public.cards(owner_id);

-- Index for fetching global cards
create index if not exists idx_cards_global on public.cards(owner_id) where owner_id is null;

-- Index for deck filtering
create index if not exists idx_cards_deck on public.cards(deck);

-- Index for intensity filtering
create index if not exists idx_cards_intensity on public.cards(intensity);

-- Index for tags (GIN index for array searches)
create index if not exists idx_cards_tags on public.cards using gin(tags);
```

## Row Level Security (RLS)

Enable RLS on both tables:

```sql
alter table public.users_profile enable row level security;
alter table public.cards enable row level security;
```

### `users_profile` Policies

```sql
-- Users can read their own profile
create policy "Users can read own profile"
  on public.users_profile for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.users_profile for update
  using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on public.users_profile for insert
  with check (auth.uid() = id);

-- Admins can read all profiles
create policy "Admins can read all profiles"
  on public.users_profile for select
  using (
    exists (
      select 1 from public.users_profile
      where id = auth.uid() and is_admin = true
    )
  );
```

### `cards` Policies

```sql
-- Everyone can read global cards
create policy "Everyone can read global cards"
  on public.cards for select
  using (owner_id is null);

-- Users can read their own custom cards
create policy "Users can read own cards"
  on public.cards for select
  using (owner_id = auth.uid());

-- Users can insert their own custom cards
create policy "Users can insert own cards"
  on public.cards for insert
  with check (owner_id = auth.uid());

-- Users can update their own custom cards
create policy "Users can update own cards"
  on public.cards for update
  using (owner_id = auth.uid());

-- Users can delete their own custom cards
create policy "Users can delete own cards"
  on public.cards for delete
  using (owner_id = auth.uid());

-- Admins can manage global cards
create policy "Admins can manage global cards"
  on public.cards for all
  using (
    owner_id is null and
    exists (
      select 1 from public.users_profile
      where id = auth.uid() and is_admin = true
    )
  );
```

## Migration Notes

- The app will automatically create a `users_profile` row when a user signs up
- `users_profile.email` should mirror `auth.users.email` for UI/account reads
- `users_profile.plan_tier` defaults to `free` for all existing and new users
- Global cards should be seeded manually or via the Admin panel
- Local cards from V2 can be migrated to cloud via the "Upload to Cloud" button in the Create page
- The new metadata fields (`is_favorite`, `intensity`, `tags`) are optional and backward compatible
- Cards without metadata will default to: `is_favorite = false`, `intensity = 'medium'`, `tags = []`
