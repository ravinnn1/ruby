-- ============================================================
-- Ruby's Safe Place — Supabase Schema (v4)
-- Paste the ENTIRE file into the Supabase SQL Editor and Run.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT everywhere.
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_config jsonb default '{}',
  preferred_theme text default 'soft-ruby',
  calming_phrase text,
  favorite_color text,
  favorite_activity text,
  onboarding_done boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can view own profile') then
    create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can insert own profile') then
    create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can update own profile') then
    create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;

-- ============================================================
-- MOOD ENTRIES
-- ============================================================
create table if not exists public.mood_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  mood text not null,
  intensity int check (intensity between 1 and 10),
  note text,
  helped_by text[] default '{}',
  made_worse text,
  created_at timestamptz default now()
);
alter table public.mood_entries enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='mood_entries' and policyname='Users can manage own mood entries') then
    create policy "Users can manage own mood entries" on public.mood_entries for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- JOURNAL ENTRIES
-- ============================================================
create table if not exists public.journal_entries (
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
alter table public.journal_entries enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='journal_entries' and policyname='Users can manage own journal entries') then
    create policy "Users can manage own journal entries" on public.journal_entries for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- EPISODE LOGS
-- ============================================================
create table if not exists public.episode_logs (
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
alter table public.episode_logs enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='episode_logs' and policyname='Users can manage own episode logs') then
    create policy "Users can manage own episode logs" on public.episode_logs for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- COMFORT ITEMS
-- ============================================================
create table if not exists public.comfort_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  title text not null,
  content text,
  item_type text default 'text',
  media_url text,
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.comfort_items enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='comfort_items' and policyname='Users can manage own comfort items') then
    create policy "Users can manage own comfort items" on public.comfort_items for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- MEMORIES
-- ============================================================
create table if not exists public.memories (
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
alter table public.memories enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='memories' and policyname='Users can manage own memories') then
    create policy "Users can manage own memories" on public.memories for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- ROUTINE TEMPLATES
-- ============================================================
create table if not exists public.routine_templates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  items jsonb default '[]',
  routine_type text default 'custom',
  created_at timestamptz default now()
);
alter table public.routine_templates enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='routine_templates' and policyname='Users can manage own routine templates') then
    create policy "Users can manage own routine templates" on public.routine_templates for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- ROUTINE COMPLETIONS
-- ============================================================
create table if not exists public.routine_completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  routine_id uuid references public.routine_templates(id) on delete cascade,
  completed_items jsonb default '[]',
  note text,
  created_at timestamptz default now()
);
alter table public.routine_completions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='routine_completions' and policyname='Users can manage own routine completions') then
    create policy "Users can manage own routine completions" on public.routine_completions for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- LETTERS
-- ============================================================
create table if not exists public.letters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  body text,
  letter_type text default 'future',
  unlock_date date,
  is_locked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.letters enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='letters' and policyname='Users can manage own letters') then
    create policy "Users can manage own letters" on public.letters for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- BUDGET ENTRIES
-- ============================================================
create table if not exists public.budget_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  amount numeric(10,2) not null,
  note text,
  entry_date date default current_date,
  created_at timestamptz default now()
);
alter table public.budget_entries enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='budget_entries' and policyname='Users can manage own budget entries') then
    create policy "Users can manage own budget entries" on public.budget_entries for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- WISHLIST ITEMS
-- ============================================================
create table if not exists public.wishlist_items (
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
alter table public.wishlist_items enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='wishlist_items' and policyname='Users can manage own wishlist items') then
    create policy "Users can manage own wishlist items" on public.wishlist_items for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- SAFE PLAN
-- ============================================================
create table if not exists public.safe_plan (
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
alter table public.safe_plan enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='safe_plan' and policyname='Users can manage own safe plan') then
    create policy "Users can manage own safe plan" on public.safe_plan for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- WORRY BOX
-- ============================================================
create table if not exists public.worry_box (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  worry_text text not null,
  action_taken text,
  tiny_next_step text,
  released boolean default false,
  created_at timestamptz default now()
);
alter table public.worry_box enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='worry_box' and policyname='Users can manage own worry box') then
    create policy "Users can manage own worry box" on public.worry_box for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- CHECK-INS
-- ============================================================
create table if not exists public.check_ins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  heaviness text,
  emotion text,
  note text,
  created_at timestamptz default now()
);
alter table public.check_ins enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='check_ins' and policyname='Users can manage own check-ins') then
    create policy "Users can manage own check-ins" on public.check_ins for all using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- SAFE PEOPLE
-- ============================================================
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
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='safe_people' and policyname='Users can manage their own safe people') then
    create policy "Users can manage their own safe people" on public.safe_people for all
      using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ============================================================
-- STORAGE BUCKET: ruby-vault
-- ============================================================
insert into storage.buckets (id, name, public)
values ('ruby-vault', 'ruby-vault', false)
on conflict (id) do nothing;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Users can upload their own files') then
    create policy "Users can upload their own files"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'ruby-vault' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Users can read their own files') then
    create policy "Users can read their own files"
      on storage.objects for select to authenticated
      using (bucket_id = 'ruby-vault' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='Users can delete their own files') then
    create policy "Users can delete their own files"
      on storage.objects for delete to authenticated
      using (bucket_id = 'ruby-vault' and auth.uid()::text = (storage.foldername(name))[1]);
  end if;
end $$;

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_profiles_updated_at  on public.profiles;
drop trigger if exists update_journal_updated_at   on public.journal_entries;
drop trigger if exists update_comfort_updated_at   on public.comfort_items;
drop trigger if exists update_memories_updated_at  on public.memories;
drop trigger if exists update_letters_updated_at   on public.letters;
drop trigger if exists update_wishlist_updated_at  on public.wishlist_items;
drop trigger if exists update_safe_plan_updated_at on public.safe_plan;

create trigger update_profiles_updated_at  before update on public.profiles        for each row execute function public.update_updated_at();
create trigger update_journal_updated_at   before update on public.journal_entries  for each row execute function public.update_updated_at();
create trigger update_comfort_updated_at   before update on public.comfort_items    for each row execute function public.update_updated_at();
create trigger update_memories_updated_at  before update on public.memories         for each row execute function public.update_updated_at();
create trigger update_letters_updated_at   before update on public.letters          for each row execute function public.update_updated_at();
create trigger update_wishlist_updated_at  before update on public.wishlist_items   for each row execute function public.update_updated_at();
create trigger update_safe_plan_updated_at before update on public.safe_plan        for each row execute function public.update_updated_at();
