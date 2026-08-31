-- ==========================================
-- 1. Create public.users profile table
-- ==========================================
create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    name text not null,
    email text not null unique,
    created_at timestamptz default now()
);

-- ==========================================
-- 2. Enable Row Level Security (RLS)
-- ==========================================
alter table public.users enable row level security;

-- ==========================================
-- 3. RLS Policies
-- ==========================================

-- Drop existing policies if re-running
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can insert their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;

-- Policy: Users can view their own profile
create policy "Users can view their own profile"
on public.users
for select
using (auth.uid() = id);

-- Policy: Users can insert their own profile
create policy "Users can insert their own profile"
on public.users
for insert
with check (auth.uid() = id or auth.uid() is null);

-- Policy: Users can update their own profile
create policy "Users can update their own profile"
on public.users
for update
using (auth.uid() = id);

-- ==========================================
-- 4. Automatic Profile Creation Trigger
-- (Guarantees public.users row creation on signup
--  even if email confirmation is turned ON)
-- ==========================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.created_at, now())
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
