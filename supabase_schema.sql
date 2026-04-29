-- KarnBoard schema
-- Paste this entire file into: Supabase → SQL Editor → New Query → Run

-- ── Profiles (extends auth.users) ────────────────────────────────
create table public.profiles (
  id        uuid references auth.users(id) on delete cascade primary key,
  name      text        not null,
  initials  text        not null,
  color     text        not null default '#7C3AED',
  skills    text[]      default '{}',
  joined_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users manage own profile"
  on public.profiles for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- ── Boards ────────────────────────────────────────────────────────
create table public.boards (
  id               uuid        primary key default gen_random_uuid(),
  owner_id         uuid        references auth.users(id) on delete cascade not null,
  name             text        not null default 'My Project',
  created_at       timestamptz default now(),
  xp               integer     default 0,
  streak_count     integer     default 0,
  last_active_date date,
  today_date       date,
  today_done_count integer     default 0,
  notes            text        default '',
  description      text        default '',
  phase            text        default 'PLANNING',
  shared           boolean     default false,
  pending_invites  jsonb       default '[]'
);

alter table public.boards enable row level security;

create policy "Users manage own boards"
  on public.boards for all
  using  (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ── Tasks ─────────────────────────────────────────────────────────
create table public.tasks (
  id                uuid   primary key,
  board_id          uuid   references public.boards(id) on delete cascade not null,
  title             text   not null,
  description       text   default '',
  priority          text   default 'medium',
  task_column       text   default 'todo',
  created_at        bigint,
  completed_at      bigint,
  xp_earned         integer default 0,
  due_date          text,
  assignee_id       text,
  assignee_name     text,
  assignee_initials text,
  assignee_color    text
);

alter table public.tasks enable row level security;

create policy "Users manage tasks on own boards"
  on public.tasks for all
  using  (exists (select 1 from public.boards where boards.id = tasks.board_id and boards.owner_id = auth.uid()))
  with check (exists (select 1 from public.boards where boards.id = tasks.board_id and boards.owner_id = auth.uid()));

-- ── Board members ─────────────────────────────────────────────────
create table public.board_members (
  id        uuid   primary key,
  board_id  uuid   references public.boards(id) on delete cascade not null,
  name      text   not null,
  initials  text   not null,
  color     text   not null,
  skills    text[] default '{}',
  role      text   default 'MEMBER',
  joined_at bigint
);

alter table public.board_members enable row level security;

create policy "Users manage members on own boards"
  on public.board_members for all
  using  (exists (select 1 from public.boards where boards.id = board_members.board_id and boards.owner_id = auth.uid()))
  with check (exists (select 1 from public.boards where boards.id = board_members.board_id and boards.owner_id = auth.uid()));

-- ── Messages ──────────────────────────────────────────────────────
create table public.messages (
  id       uuid   primary key,
  board_id uuid   references public.boards(id) on delete cascade not null,
  user_id  text,
  name     text   not null,
  initials text   not null,
  color    text   not null,
  text     text   not null,
  ts       bigint
);

alter table public.messages enable row level security;

create policy "Users manage messages on own boards"
  on public.messages for all
  using  (exists (select 1 from public.boards where boards.id = messages.board_id and boards.owner_id = auth.uid()))
  with check (exists (select 1 from public.boards where boards.id = messages.board_id and boards.owner_id = auth.uid()));

-- ── Activity log ──────────────────────────────────────────────────
create table public.activity_log (
  id             uuid   primary key,
  board_id       uuid   references public.boards(id) on delete cascade not null,
  actor_name     text   not null,
  actor_initials text   not null,
  actor_color    text   not null,
  text           text   not null,
  ts             bigint
);

alter table public.activity_log enable row level security;

create policy "Users manage activity on own boards"
  on public.activity_log for all
  using  (exists (select 1 from public.boards where boards.id = activity_log.board_id and boards.owner_id = auth.uid()))
  with check (exists (select 1 from public.boards where boards.id = activity_log.board_id and boards.owner_id = auth.uid()));

-- ── Moodboard items ───────────────────────────────────────────────
create table public.moodboard_items (
  id         uuid   primary key,
  board_id   uuid   references public.boards(id) on delete cascade not null,
  text       text   default '',
  color      text   not null,
  created_at bigint
);

alter table public.moodboard_items enable row level security;

create policy "Users manage moodboard on own boards"
  on public.moodboard_items for all
  using  (exists (select 1 from public.boards where boards.id = moodboard_items.board_id and boards.owner_id = auth.uid()))
  with check (exists (select 1 from public.boards where boards.id = moodboard_items.board_id and boards.owner_id = auth.uid()));
