-- ==========================================
-- Migration: 004 — Learner Roadmap Stage Progress
-- ==========================================

create table if not exists public.learner_stage_progress (
    id                uuid primary key default gen_random_uuid(),
    user_id           uuid not null references public.users(id) on delete cascade,
    stage_id          integer not null,
    status            text not null check (status in ('COMPLETED', 'IN_PROGRESS', 'NOT_STARTED', 'LOCKED')),
    progress          integer not null default 0 check (progress >= 0 and progress <= 100),
    started_at        timestamptz,
    completed_at      timestamptz,
    last_activity_at  timestamptz default now(),
    constraint uq_user_stage unique (user_id, stage_id)
);

create index if not exists idx_learner_stage_progress_user on public.learner_stage_progress(user_id);

-- Enable RLS
alter table public.learner_stage_progress enable row level security;

-- Policies
drop policy if exists "Users can view their own stage progress" on public.learner_stage_progress;
create policy "Users can view their own stage progress"
on public.learner_stage_progress for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own stage progress" on public.learner_stage_progress;
create policy "Users can insert their own stage progress"
on public.learner_stage_progress for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own stage progress" on public.learner_stage_progress;
create policy "Users can update their own stage progress"
on public.learner_stage_progress for update using (auth.uid() = user_id);
