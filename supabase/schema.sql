-- Experts Network application submissions.
-- Run this in the Supabase SQL editor (or via the CLI) to create the table.
--
-- This file documents the v1 baseline schema. Changes since v1 live as
-- numbered files in supabase/migrations/ — check there for the current
-- shape of the table (e.g. future_opportunities was dropped and
-- hours_per_week changed type in 0001_v2_field_cleanup.sql).

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Contact
  full_name text not null,
  email text not null,

  -- Part 1: Expertise & Network Fit
  primary_role text not null,
  expertise_areas text[] not null default '{}',
  bio text not null,
  portfolio_links text,
  preferred_project_types text[] not null default '{}',
  primary_industries text[] not null default '{}',
  hours_per_week integer,
  preferred_contract_length text,
  compensation_type text,
  compensation_details text,
  future_opportunities text,

  -- Part 2: Experience
  companies_worked_with text,
  ai_experience text,
  technical_skills text,
  languages text,
  research_methods text,

  -- Part 3: Specializations
  specializations text[] not null default '{}',

  -- Part 4: Matching
  exciting_projects text,
  deep_industries text,
  long_term_interest text,
  remote_only text,
  time_zone text,
  earliest_availability date
);

-- Lock the table down: only the service role (used server-side by
-- api/submit-application.ts) can read or write. No anon/public access.
alter table public.applications enable row level security;
