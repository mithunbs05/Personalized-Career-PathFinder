-- ==========================================
-- Migration: 002 — Profiles Table & User Onboarding Flag
-- ==========================================

-- 1. Add onboarding_completed flag to public.users
-- ==========================================
alter table public.users
  add column if not exists onboarding_completed boolean default false;

-- ==========================================
-- 2. Create public.profiles table
-- ==========================================
create table if not exists public.profiles (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references public.users(id) on delete cascade unique,
    profile_metadata  jsonb not null default '{}'::jsonb,
    completed_categories text[] default '{}'::text[],
    onboarding_completed boolean default false,
    created_at    timestamptz default now(),
    updated_at    timestamptz default now()
);

-- Index for fast user lookups
create index if not exists idx_profiles_user_id on public.profiles(user_id);

-- ==========================================
-- 3. Auto-update updated_at trigger
-- ==========================================
create or replace function public.handle_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_profiles_updated_at();

-- ==========================================
-- 4. Enable Row Level Security
-- ==========================================
alter table public.profiles enable row level security;

-- ==========================================
-- 5. RLS Policies
-- ==========================================
drop policy if exists "Users can view their own profile data" on public.profiles;
drop policy if exists "Users can insert their own profile data" on public.profiles;
drop policy if exists "Users can update their own profile data" on public.profiles;

-- Select: users can only read their own profile
create policy "Users can view their own profile data"
on public.profiles
for select
using (auth.uid() = user_id);

-- Insert: users can only insert their own profile
create policy "Users can insert their own profile data"
on public.profiles
for insert
with check (auth.uid() = user_id);

-- Update: users can only update their own profile
create policy "Users can update their own profile data"
on public.profiles
for update
using (auth.uid() = user_id);

-- ==========================================
-- 6. Service role bypass for backend upserts
-- ==========================================
-- The FastAPI backend uses the service_role key which bypasses RLS.
-- No additional policy needed for service_role operations.
