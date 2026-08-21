-- The project already had an unused empty table called "Expert_Network"
-- (just id/created_at, no real columns, nothing written to it) alongside
-- the actual working table "applications". Drop the empty one and rename
-- the real table to match the name shown in the dashboard.

drop table if exists public."Expert_Network";

alter table public.applications rename to "Expert_Network";
