-- Explicit, granular, revisitable consent for the two real data uses this
-- app has today: sharing a profile with a matched company, and sending
-- marketing/opportunity emails. Both default off (opt-in, not opt-out).
--
-- Deliberately append-only rather than a couple of boolean columns on
-- experts: every toggle change inserts a new row, so there's a full audit
-- trail of who agreed to what and when, not just current state. The
-- current value for a (user_id, consent_type) pair is its most recent row.
--
-- AI training/evaluation data use is NOT represented here on purpose —
-- per product decision, that never happens just from having an account or
-- profile. It only happens per individual project submission, with its
-- own separate, explicit agreement at that time. No project-submission
-- feature exists yet, so there's nothing to model until it does; whatever
-- builds that flow must add its own consent step then, not reuse this
-- table's blanket account-level toggles.

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id),
  consent_type text not null, -- 'profile_sharing' | 'marketing_emails'
  granted boolean not null
);

create index consents_user_id_type_idx on public.consents (user_id, consent_type, created_at desc);

alter table public.consents enable row level security;

-- Same discipline as experts/expert_tags: read your own current state
-- directly, but all writes go through the service-role API route.
create policy "Users can view their own consent history"
  on public.consents for select
  to authenticated
  using (user_id = auth.uid());

grant select on public.consents to authenticated;
grant select, insert on public.consents to service_role;
