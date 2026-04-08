-- MindOS Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Thoughts: raw brain dumps (voice or text)
create table if not exists thoughts (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  type text not null default 'thought' check (type in ('thought', 'task', 'reflection', 'goal', 'habit')),
  source text not null default 'text' check (source in ('text', 'voice')),
  ai_analysis jsonb,
  created_at timestamptz not null default now()
);

-- Tasks: actionable items extracted from thoughts or created directly
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  thought_id uuid references thoughts(id) on delete set null,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  follow_up text,
  due_date date,
  created_at timestamptz not null default now()
);

-- Task links: relationships between tasks (leads_to, depends_on, related)
create table if not exists task_links (
  id uuid primary key default uuid_generate_v4(),
  source_task_id uuid not null references tasks(id) on delete cascade,
  target_task_id uuid not null references tasks(id) on delete cascade,
  relationship text not null default 'related' check (relationship in ('leads_to', 'depends_on', 'related')),
  constraint no_self_link check (source_task_id != target_task_id)
);

-- Habits: recurring behaviors to track
create table if not exists habits (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
  color text not null default '#6366f1',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Habit logs: daily completion records
create table if not exists habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references habits(id) on delete cascade,
  log_date date not null default current_date,
  completed boolean not null default true,
  unique (habit_id, log_date)
);

-- Core identity: who you are — values, personality traits, principles
create table if not exists core_identity (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in ('values', 'personality', 'goals', 'principles')),
  trait text not null,
  value text,
  updated_at timestamptz not null default now()
);

-- Daily goals: what you intend to do each day + reflection
create table if not exists daily_goals (
  id uuid primary key default uuid_generate_v4(),
  goal_date date not null default current_date unique,
  goals jsonb not null default '[]'::jsonb,
  reflection text,
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_priority on tasks(priority);
create index if not exists idx_tasks_thought on tasks(thought_id);
create index if not exists idx_habit_logs_date on habit_logs(log_date);
create index if not exists idx_habit_logs_habit on habit_logs(habit_id);
create index if not exists idx_thoughts_created on thoughts(created_at desc);
create index if not exists idx_daily_goals_date on daily_goals(goal_date);
