-- v2: two-step application flow. Step 1 captures linkedin_url/full_name/email
-- and saves immediately; step 2 (role, expertise, bio, hours/week,
-- compensation, industries) updates that same row afterward. primary_role
-- and bio can no longer be NOT NULL since step 1 inserts a row before
-- they're known.

alter table public.applications add column if not exists linkedin_url text;

alter table public.applications alter column primary_role drop not null;
alter table public.applications alter column bio drop not null;
