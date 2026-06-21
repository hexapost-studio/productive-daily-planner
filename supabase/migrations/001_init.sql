-- Active RLS sur toutes les tables
-- Chaque user ne voit que ses propres données

create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default '',
  planner_start_date date,
  created_at timestamptz default now()
);

create table if not exists public.project_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text not null default '#6366f1',
  position integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  position integer not null default 0,
  designation text not null default '',
  type text not null default '',
  priority text not null default '',
  impact_level text not null default 'Moyen',
  start_date date,
  deadline date,
  status text not null default 'En attente',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  key_people text not null default '',
  comments text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  day_of_week text not null,
  designation text not null default '',
  domain text not null default '',
  remarks text not null default '',
  position integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  week_id text not null,
  year integer not null,
  week_number integer not null,
  start_date date not null,
  main_tasks jsonb not null default '[]',
  daily_plans jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, week_id)
);

-- RLS policies
alter table public.user_profiles enable row level security;
alter table public.project_types enable row level security;
alter table public.projects enable row level security;
alter table public.recurring_tasks enable row level security;
alter table public.weekly_plans enable row level security;

create policy "Users see own profile" on public.user_profiles for all using (auth.uid() = id);
create policy "Users see own project types" on public.project_types for all using (auth.uid() = user_id);
create policy "Users see own projects" on public.projects for all using (auth.uid() = user_id);
create policy "Users see own recurring tasks" on public.recurring_tasks for all using (auth.uid() = user_id);
create policy "Users see own weekly plans" on public.weekly_plans for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();

create trigger weekly_plans_updated_at before update on public.weekly_plans
  for each row execute procedure public.set_updated_at();
