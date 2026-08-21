-- v2: drop future_opportunities (that content now lives in landing copy,
-- not the application form) and move hours_per_week from a raw integer to
-- a fixed band string (e.g. "10–20 hrs/week") to match the new dropdown.

alter table public.applications drop column if exists future_opportunities;

alter table public.applications
  alter column hours_per_week type text using hours_per_week::text;
