-- ============================================================
-- Ruby's Safe Place — Supabase Schema
-- ============================================================

-- safe_people table (added in v2 upgrade)
create table if not exists public.safe_people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  relationship text,
  contact text,
  helps_with text,
  what_to_say text,
  notes text,
  created_at timestamptz default now()
);

alter table public.safe_people enable row level security;

create policy "Users can manage their own safe people"
  on public.safe_people
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Add onboarding_done column to profiles if not exists
alter table public.profiles
  add column if not exists onboarding_done boolean default false;

-- Run this in your Supabase SQL editor to set up all tables.
-- All tables have Row Level Security (RLS) enabled.
-- Users can only access their own data.
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_config jsonb default '{}',
  preferred_theme text default 'soft-ruby',
  calming_phrase text,
  favorite_color text,
  favorite_activity text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ============================================================
-- MOOD ENTRIES
-- ============================================================
create table if not exists mood_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  mood text not null,
  intensity int check (intensity between 1 and 10),
  note text,
  helped_by text[] default '{}',
  made_worse text,
  created_at timestamptz default now()
);

alter table mood_entries enable row level security;

create policy "Users can manage own mood entries"
  on mood_entries for all using (auth.uid() = user_id);

-- ============================================================
-- JOURNAL ENTRIES
-- ============================================================
create table if not exists journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  body text not null,
  prompt_category text,
  mood text,
  intensity int check (intensity between 1 and 10),
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table journal_entries enable row level security;

create policy "Users can manage own journal entries"
  on journal_entries for all using (auth.uid() = user_id);

-- ============================================================
-- EPISODE LOGS
-- ============================================================
create table if not exists episode_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  trigger text,
  intensity int check (intensity between 1 and 10),
  body_sensations text[] default '{}',
  what_helped text[] default '{}',
  aftercare_completed text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

alter table episode_logs enable row level security;

create policy "Users can manage own episode logs"
  on episode_logs for all using (auth.uid() = user_id);

-- ============================================================
-- COMFORT ITEMS
-- ============================================================
create table if not exists comfort_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  title text not null,
  content text,
  item_type text default 'text', -- text | image | link | audio | checklist | quote | memory
  media_url text,
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table comfort_items enable row level security;

create policy "Users can manage own comfort items"
  on comfort_items for all using (auth.uid() = user_id);

-- ============================================================
-- MEMORIES
-- ============================================================
create table if not exists memories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  caption text,
  memory_date date,
  mood text,
  tags text[] default '{}',
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table memories enable row level security;

create policy "Users can manage own memories"
  on memories for all using (auth.uid() = user_id);

-- ============================================================
-- ROUTINE TEMPLATES
-- ============================================================
create table if not exists routine_templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  items jsonb default '[]',
  routine_type text default 'custom', -- morning | nightly | aftercare | custom
  created_at timestamptz default now()
);

alter table routine_templates enable row level security;

create policy "Users can manage own routine templates"
  on routine_templates for all using (auth.uid() = user_id);

-- ============================================================
-- ROUTINE COMPLETIONS
-- ============================================================
create table if not exists routine_completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  routine_id uuid references routine_templates(id) on delete cascade,
  completed_items jsonb default '[]',
  note text,
  created_at timestamptz default now()
);

alter table routine_completions enable row level security;

create policy "Users can manage own routine completions"
  on routine_completions for all using (auth.uid() = user_id);

-- ============================================================
-- LETTERS
-- ============================================================
create table if not exists letters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  body text,
  letter_type text default 'future', -- future | anxious | alone | confidence | unsent | custom
  unlock_date date,
  is_locked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table letters enable row level security;

create policy "Users can manage own letters"
  on letters for all using (auth.uid() = user_id);

-- ============================================================
-- BUDGET ENTRIES
-- ============================================================
create table if not exists budget_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  amount numeric(10,2) not null,
  note text,
  entry_date date default current_date,
  created_at timestamptz default now()
);

alter table budget_entries enable row level security;

create policy "Users can manage own budget entries"
  on budget_entries for all using (auth.uid() = user_id);

-- ============================================================
-- WISHLIST ITEMS
-- ============================================================
create table if not exists wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  price numeric(10,2),
  url text,
  reason text,
  pause_reflection jsonb default '{}',
  purchased boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table wishlist_items enable row level security;

create policy "Users can manage own wishlist items"
  on wishlist_items for all using (auth.uid() = user_id);

-- ============================================================
-- SAFE PLAN
-- ============================================================
create table if not exists safe_plan (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  warning_signs text[] default '{}',
  helpful_actions text[] default '{}',
  unhelpful_actions text[] default '{}',
  safe_people jsonb default '[]',
  safe_places text[] default '{}',
  emergency_steps text[] default '{}',
  reassurance_text text,
  want_to_hear text,
  dont_want_to_hear text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table safe_plan enable row level security;

create policy "Users can manage own safe plan"
  on safe_plan for all using (auth.uid() = user_id);

-- ============================================================
-- WORRY BOX
-- ============================================================
create table if not exists worry_box (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  worry_text text not null,
  action_taken text, -- save | release | next-step | journal | episode
  tiny_next_step text,
  released boolean default false,
  created_at timestamptz default now()
);

alter table worry_box enable row level security;

create policy "Users can manage own worry box"
  on worry_box for all using (auth.uid() = user_id);

-- ============================================================
-- CHECK-INS (daily home check-in)
-- ============================================================
create table if not exists check_ins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  heaviness text, -- light | manageable | heavy | overwhelming
  emotion text,
  note text,
  created_at timestamptz default now()
);

alter table check_ins enable row level security;

create policy "Users can manage own check-ins"
  on check_ins for all using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS (run separately or via Supabase dashboard)
-- ============================================================
-- Create a private bucket called 'ruby-vault'
-- Storage path convention: {user_id}/memories/{filename}
-- Storage path convention: {user_id}/comfort/{filename}
--
-- Storage RLS policies (set in Supabase dashboard):
-- Allow authenticated users to upload to their own folder:
--   bucket_id = 'ruby-vault' AND auth.uid()::text = (storage.foldername(name))[1]
-- Allow authenticated users to read their own files:
--   bucket_id = 'ruby-vault' AND auth.uid()::text = (storage.foldername(name))[1]
-- ============================================================

-- ============================================================
-- HELPER FUNCTION: auto-update updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger update_journal_updated_at
  before update on journal_entries
  for each row execute function update_updated_at();

create trigger update_comfort_updated_at
  before update on comfort_items
  for each row execute function update_updated_at();

create trigger update_memories_updated_at
  before update on memories
  for each row execute function update_updated_at();

create trigger update_letters_updated_at
  before update on letters
  for each row execute function update_updated_at();

create trigger update_wishlist_updated_at
  before update on wishlist_items
  for each row execute function update_updated_at();

create trigger update_safe_plan_updated_at
  before update on safe_plan
  for each row execute function update_updated_at();
