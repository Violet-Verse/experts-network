-- Deeper expert profile schema, built for later use once the "Expert
-- Verification + Profile" form (sent post-acceptance) exists. Nothing in
-- the app writes to these tables yet — this is the backing schema for
-- that future form and the Expert -> Capability -> Task matching layer.

create table public.experts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  application_id uuid references public."Expert_Network"(id),

  full_name text not null,
  email text not null unique,
  location text,
  time_zone text,
  languages text[] not null default '{}',

  profession text,
  years_experience integer,
  bio text,
  portfolio_links text,
  ai_experience text,

  compensation_range_min integer,
  compensation_range_max integer,
  compensation_unit text, -- 'hourly' | 'project' | 'flexible'

  hours_per_week_available integer,
  engagement_preferences text[] not null default '{}', -- 'ongoing' | 'one-off' | 'advisory' | ...
  conflict_restrictions text[] not null default '{}',   -- companies/orgs they can't work with

  vetting_status text not null default 'pending',        -- 'pending' | 'approved' | 'rejected' | 'needs_review'
  reliability_score numeric                                -- cached, computed from expert_ratings
);

create index experts_application_id_idx on public.experts (application_id);
create index experts_vetting_status_idx on public.experts (vetting_status);

-- Controlled vocabulary for everything taggable: industries, skills, domain
-- expertise, and task capabilities all live here (category distinguishes
-- them) so a researcher's request can mix them freely in one join.
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  category text not null, -- 'industry' | 'skill' | 'domain_expertise' | 'task_capability'
  label text not null,
  unique (category, label)
);

create table public.expert_tags (
  expert_id uuid not null references public.experts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (expert_id, tag_id)
);

create index expert_tags_tag_id_idx on public.expert_tags (tag_id);

-- Individual researcher ratings; these feed the cached reliability_score on
-- experts (via app logic or a trigger) rather than being entered directly.
create table public.expert_ratings (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid not null references public.experts(id) on delete cascade,
  researcher_name text,
  project_reference text,
  score numeric not null check (score >= 0 and score <= 5),
  comment text,
  created_at timestamptz not null default now()
);

create index expert_ratings_expert_id_idx on public.expert_ratings (expert_id);

-- Same lockdown pattern as Expert_Network: RLS on, no policies yet, so only
-- the service role (used server-side) can read/write until a real access
-- model (e.g. authenticated experts editing their own row, staff reviewing
-- vetting_status) is designed.
alter table public.experts enable row level security;
alter table public.tags enable row level security;
alter table public.expert_tags enable row level security;
alter table public.expert_ratings enable row level security;

grant select, insert, update, delete on public.experts to service_role;
grant select, insert, update, delete on public.tags to service_role;
grant select, insert, update, delete on public.expert_tags to service_role;
grant select, insert, update, delete on public.expert_ratings to service_role;
