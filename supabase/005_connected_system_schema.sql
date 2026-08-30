-- ============================================================================
-- Migration 005: Unified & Connected Multi-Table Schema for PathAI
-- ============================================================================
-- This migration connects and unifies all 9 core tables:
-- 1. users
-- 2. profiles
-- 3. roadmaps
-- 4. learner_stage_progress
-- 5. mentor_sessions
-- 6. mentor_messages
-- 7. mentor_assessments
-- 8. mentor_assessment_answers
-- 9. mentor_topic_progress
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE (Linked to auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.users (
    id                    uuid primary key references auth.users(id) on delete cascade,
    name                  text not null,
    email                 text not null unique,
    onboarding_completed  boolean default false,
    created_at            timestamptz default now()
);

alter table public.users enable row level security;

drop policy if exists "Users select own profile" on public.users;
create policy "Users select own profile"
on public.users for select
using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.users;
create policy "Users insert own profile"
on public.users for insert
with check (auth.uid() = id or auth.uid() is null);

drop policy if exists "Users update own profile" on public.users;
create policy "Users update own profile"
on public.users for update
using (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 2. PROFILES TABLE (Linked to public.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
    id                    uuid primary key default gen_random_uuid(),
    user_id               uuid not null references public.users(id) on delete cascade unique,
    profile_metadata      jsonb not null default '{}'::jsonb,
    completed_categories  text[] default '{}'::text[],
    onboarding_completed  boolean default false,
    created_at            timestamptz default now(),
    updated_at            timestamptz default now()
);

create index if not exists idx_profiles_user_id on public.profiles(user_id);
alter table public.profiles enable row level security;

drop policy if exists "Profiles select own" on public.profiles;
create policy "Profiles select own" on public.profiles for select using (auth.uid() = user_id);

drop policy if exists "Profiles insert own" on public.profiles;
create policy "Profiles insert own" on public.profiles for insert with check (auth.uid() = user_id);

drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own" on public.profiles for update using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. ROADMAPS TABLE (Linked to public.users)
-- ----------------------------------------------------------------------------
create table if not exists public.roadmaps (
    id                    uuid primary key default gen_random_uuid(),
    user_id               uuid not null references public.users(id) on delete cascade,
    target_role           text not null default 'AI/ML Engineer',
    stages_data           jsonb not null default '[]'::jsonb,
    overall_progress      integer not null default 0 check (overall_progress >= 0 and overall_progress <= 100),
    created_at            timestamptz default now(),
    updated_at            timestamptz default now(),
    constraint uq_user_roadmap_role unique (user_id, target_role)
);

create index if not exists idx_roadmaps_user_id on public.roadmaps(user_id);
alter table public.roadmaps enable row level security;

drop policy if exists "Roadmaps select own" on public.roadmaps;
create policy "Roadmaps select own" on public.roadmaps for select using (auth.uid() = user_id);

drop policy if exists "Roadmaps insert own" on public.roadmaps;
create policy "Roadmaps insert own" on public.roadmaps for insert with check (auth.uid() = user_id);

drop policy if exists "Roadmaps update own" on public.roadmaps;
create policy "Roadmaps update own" on public.roadmaps for update using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. LEARNER_STAGE_PROGRESS TABLE (Linked to public.users)
-- ----------------------------------------------------------------------------
create table if not exists public.learner_stage_progress (
    id                    uuid primary key default gen_random_uuid(),
    user_id               uuid not null references public.users(id) on delete cascade,
    stage_id              integer not null,
    status                text not null check (status in ('COMPLETED', 'IN_PROGRESS', 'NOT_STARTED', 'LOCKED')),
    progress              integer not null default 0 check (progress >= 0 and progress <= 100),
    started_at            timestamptz,
    completed_at          timestamptz,
    last_activity_at      timestamptz default now(),
    constraint uq_user_stage unique (user_id, stage_id)
);

create index if not exists idx_learner_stage_progress_user on public.learner_stage_progress(user_id);
alter table public.learner_stage_progress enable row level security;

drop policy if exists "Stage progress select own" on public.learner_stage_progress;
create policy "Stage progress select own" on public.learner_stage_progress for select using (auth.uid() = user_id);

drop policy if exists "Stage progress insert own" on public.learner_stage_progress;
create policy "Stage progress insert own" on public.learner_stage_progress for insert with check (auth.uid() = user_id);

drop policy if exists "Stage progress update own" on public.learner_stage_progress;
create policy "Stage progress update own" on public.learner_stage_progress for update using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5. MENTOR_SESSIONS TABLE (Linked to public.users)
-- ----------------------------------------------------------------------------
create table if not exists public.mentor_sessions (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references public.users(id) on delete cascade,
    domain        text not null,
    skill         text not null,
    topic         text,
    roadmap_stage text not null,
    mode          text not null check (mode in ('learn', 'practice', 'assess')),
    started_at    timestamptz default now(),
    ended_at      timestamptz,
    status        text not null default 'active' check (status in ('active', 'completed', 'paused'))
);

create index if not exists idx_mentor_sessions_user_id on public.mentor_sessions(user_id);
create index if not exists idx_mentor_sessions_started_at on public.mentor_sessions(started_at desc);
alter table public.mentor_sessions enable row level security;

drop policy if exists "Mentor sessions select own" on public.mentor_sessions;
create policy "Mentor sessions select own" on public.mentor_sessions for select using (auth.uid() = user_id);

drop policy if exists "Mentor sessions insert own" on public.mentor_sessions;
create policy "Mentor sessions insert own" on public.mentor_sessions for insert with check (auth.uid() = user_id);

drop policy if exists "Mentor sessions update own" on public.mentor_sessions;
create policy "Mentor sessions update own" on public.mentor_sessions for update using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. MENTOR_MESSAGES TABLE (Linked to public.mentor_sessions & public.users)
-- ----------------------------------------------------------------------------
create table if not exists public.mentor_messages (
    id          uuid primary key default gen_random_uuid(),
    session_id  uuid not null references public.mentor_sessions(id) on delete cascade,
    user_id     uuid not null references public.users(id) on delete cascade,
    role        text not null check (role in ('user', 'assistant', 'system')),
    content     text not null,
    metadata    jsonb not null default '{}'::jsonb,
    created_at  timestamptz default now()
);

create index if not exists idx_mentor_messages_session_id on public.mentor_messages(session_id);
create index if not exists idx_mentor_messages_created_at on public.mentor_messages(created_at asc);
alter table public.mentor_messages enable row level security;

drop policy if exists "Mentor messages select own" on public.mentor_messages;
create policy "Mentor messages select own" on public.mentor_messages for select using (auth.uid() = user_id);

drop policy if exists "Mentor messages insert own" on public.mentor_messages;
create policy "Mentor messages insert own" on public.mentor_messages for insert with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 7. MENTOR_ASSESSMENTS TABLE (Linked to public.mentor_sessions & public.users)
-- ----------------------------------------------------------------------------
create table if not exists public.mentor_assessments (
    id               uuid primary key default gen_random_uuid(),
    session_id       uuid references public.mentor_sessions(id) on delete set null,
    user_id          uuid not null references public.users(id) on delete cascade,
    skill            text not null,
    topic            text,
    score            integer not null check (score >= 0 and score <= 100),
    total_questions  integer not null check (total_questions > 0),
    questions_data   jsonb not null default '[]'::jsonb,
    completed_at     timestamptz default now()
);

create index if not exists idx_mentor_assessments_user_id on public.mentor_assessments(user_id);
alter table public.mentor_assessments enable row level security;

drop policy if exists "Assessments select own" on public.mentor_assessments;
create policy "Assessments select own" on public.mentor_assessments for select using (auth.uid() = user_id);

drop policy if exists "Assessments insert own" on public.mentor_assessments;
create policy "Assessments insert own" on public.mentor_assessments for insert with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 8. MENTOR_ASSESSMENT_ANSWERS TABLE (Linked to public.mentor_assessments)
-- ----------------------------------------------------------------------------
create table if not exists public.mentor_assessment_answers (
    id             uuid primary key default gen_random_uuid(),
    assessment_id  uuid not null references public.mentor_assessments(id) on delete cascade,
    question_id    text not null,
    answer         text not null,
    correct        boolean not null,
    created_at     timestamptz default now()
);

create index if not exists idx_mentor_assessment_answers_assessment_id on public.mentor_assessment_answers(assessment_id);
alter table public.mentor_assessment_answers enable row level security;

drop policy if exists "Answers select own" on public.mentor_assessment_answers;
create policy "Answers select own" on public.mentor_assessment_answers for select
using (
    exists (
        select 1 from public.mentor_assessments
        where public.mentor_assessments.id = public.mentor_assessment_answers.assessment_id
        and public.mentor_assessments.user_id = auth.uid()
    )
);

drop policy if exists "Answers insert own" on public.mentor_assessment_answers;
create policy "Answers insert own" on public.mentor_assessment_answers for insert
with check (
    exists (
        select 1 from public.mentor_assessments
        where public.mentor_assessments.id = public.mentor_assessment_answers.assessment_id
        and public.mentor_assessments.user_id = auth.uid()
    )
);

-- ----------------------------------------------------------------------------
-- 9. MENTOR_TOPIC_PROGRESS TABLE (Linked to public.users)
-- ----------------------------------------------------------------------------
create table if not exists public.mentor_topic_progress (
    id               uuid primary key default gen_random_uuid(),
    user_id          uuid not null references public.users(id) on delete cascade,
    skill_id         text not null,
    skill_name       text not null,
    domain           text not null,
    topic            text,
    mastery          integer not null default 0 check (mastery >= 0 and mastery <= 100),
    attempts         integer not null default 1,
    correct_answers  integer not null default 0,
    last_assessed_at timestamptz default now(),
    constraint uq_user_skill_topic unique (user_id, skill_id, topic)
);

create index if not exists idx_mentor_topic_progress_user on public.mentor_topic_progress(user_id);
alter table public.mentor_topic_progress enable row level security;

drop policy if exists "Topic progress select own" on public.mentor_topic_progress;
create policy "Topic progress select own" on public.mentor_topic_progress for select using (auth.uid() = user_id);

drop policy if exists "Topic progress insert own" on public.mentor_topic_progress;
create policy "Topic progress insert own" on public.mentor_topic_progress for insert with check (auth.uid() = user_id);

drop policy if exists "Topic progress update own" on public.mentor_topic_progress;
create policy "Topic progress update own" on public.mentor_topic_progress for update using (auth.uid() = user_id);
