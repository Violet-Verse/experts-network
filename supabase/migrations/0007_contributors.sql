-- Role gate for the dashboard, mirroring the Violet Verse pattern of a
-- manually-maintained role table: Melissa adds a row here (via the Supabase
-- Table Editor) once she's approved someone, and that's what unlocks the
-- opportunities dashboard for their email. Logging in alone is not enough.

create table public.contributors (
  email text primary key,
  role text not null default 'contributor', -- 'contributor' | 'admin'
  created_at timestamptz not null default now()
);

alter table public.contributors enable row level security;

-- A signed-in user may only check their own row (to resolve their own
-- role client-side) — never browse the full contributor list.
create policy "Users can view their own contributor row"
  on public.contributors for select
  to authenticated
  using (email = (auth.jwt() ->> 'email'));

grant select on public.contributors to authenticated;
grant select, insert, update, delete on public.contributors to service_role;
