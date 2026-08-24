-- Opportunities feed shown on the authenticated dashboard: both externally
-- synced listings (Hacker News "Who's Hiring", RemoteOK, We Work Remotely)
-- and internal Verso-authored opportunities (e.g. "complete this training").

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  source text not null,               -- 'hn' | 'remoteok' | 'wwr' | 'verso'
  external_id text,                   -- id from the source; null for verso-authored rows
  type text not null default 'job',   -- 'job' | 'training' | 'project'

  title text not null,
  company text,
  description text,
  url text,
  tags text[] not null default '{}',
  location text,
  remote boolean,
  posted_at timestamptz,

  unique (source, external_id)
);

create index opportunities_posted_at_idx on public.opportunities (posted_at desc);
create index opportunities_source_idx on public.opportunities (source);

alter table public.opportunities enable row level security;

-- Any authenticated (logged-in) user can read the whole feed — it's shared
-- content, not per-user data. Only service_role (the sync function, or
-- manual entry via the dashboard) can write.
create policy "Authenticated users can view opportunities"
  on public.opportunities for select
  to authenticated
  using (true);

grant select on public.opportunities to authenticated;
grant select, insert, update, delete on public.opportunities to service_role;
