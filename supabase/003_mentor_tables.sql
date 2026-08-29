-- ==========================================
-- Migration: 003 — AI Mentor Tables & Policies
-- ==========================================

-- 1. Create public.mentor_sessions table
-- ==========================================
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

-- 2. Create public.mentor_messages table
-- ==========================================
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

-- 3. Create public.mentor_assessments table
-- ==========================================
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

-- 4. Create public.mentor_assessment_answers table
-- ==========================================
create table if not exists public.mentor_assessment_answers (
    id             uuid primary key default gen_random_uuid(),
    assessment_id  uuid not null references public.mentor_assessments(id) on delete cascade,
    question_id    text not null,
    answer         text not null,
    correct        boolean not null,
    created_at     timestamptz default now()
);

create index if not exists idx_mentor_assessment_answers_assessment_id on public.mentor_assessment_answers(assessment_id);

-- 5. Create public.mentor_topic_progress table
-- ==========================================
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

-- ==========================================
-- 6. Enable Row Level Security (RLS)
-- ==========================================
alter table public.mentor_sessions enable row level security;
alter table public.mentor_messages enable row level security;
alter table public.mentor_assessments enable row level security;
alter table public.mentor_assessment_answers enable row level security;
alter table public.mentor_topic_progress enable row level security;

-- ==========================================
-- 7. RLS Policies
-- ==========================================

-- Sessions: Users can select/insert/update their own sessions
drop policy if exists "Users can view their own mentor sessions" on public.mentor_sessions;
create policy "Users can view their own mentor sessions"
on public.mentor_sessions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own mentor sessions" on public.mentor_sessions;
create policy "Users can insert their own mentor sessions"
on public.mentor_sessions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own mentor sessions" on public.mentor_sessions;
create policy "Users can update their own mentor sessions"
on public.mentor_sessions for update using (auth.uid() = user_id);

-- Messages: Users can select/insert their own messages
drop policy if exists "Users can view their own mentor messages" on public.mentor_messages;
create policy "Users can view their own mentor messages"
on public.mentor_messages for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own mentor messages" on public.mentor_messages;
create policy "Users can insert their own mentor messages"
on public.mentor_messages for insert with check (auth.uid() = user_id);

-- Assessments: Users can view/insert their own assessments
drop policy if exists "Users can view their own assessments" on public.mentor_assessments;
create policy "Users can view their own assessments"
on public.mentor_assessments for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own assessments" on public.mentor_assessments;
create policy "Users can insert their own assessments"
on public.mentor_assessments for insert with check (auth.uid() = user_id);

-- Answers: Users can view answers of their assessments
drop policy if exists "Users can view their own assessment answers" on public.mentor_assessment_answers;
create policy "Users can view their own assessment answers"
on public.mentor_assessment_answers for select
using (
    exists (
        select 1 from public.mentor_assessments
        where public.mentor_assessments.id = public.mentor_assessment_answers.assessment_id
        and public.mentor_assessments.user_id = auth.uid()
    )
);

drop policy if exists "Users can insert their own assessment answers" on public.mentor_assessment_answers;
create policy "Users can insert their own assessment answers"
on public.mentor_assessment_answers for insert
with check (
    exists (
        select 1 from public.mentor_assessments
        where public.mentor_assessments.id = public.mentor_assessment_answers.assessment_id
        and public.mentor_assessments.user_id = auth.uid()
    )
);

-- Topic Progress: Users can view/insert/update their topic progress
drop policy if exists "Users can view their own topic progress" on public.mentor_topic_progress;
create policy "Users can view their own topic progress"
on public.mentor_topic_progress for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own topic progress" on public.mentor_topic_progress;
create policy "Users can insert their own topic progress"
on public.mentor_topic_progress for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own topic progress" on public.mentor_topic_progress;
create policy "Users can update their own topic progress"
on public.mentor_topic_progress for update using (auth.uid() = user_id);
