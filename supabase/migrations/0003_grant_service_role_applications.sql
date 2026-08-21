-- service_role was missing baseline table privileges on public.applications
-- (only had REFERENCES/TRIGGER/TRUNCATE), causing every insert/update from
-- api/*.ts to fail with "permission denied for table applications" (42501)
-- even though it correctly bypasses RLS. Grant the missing privileges.

grant select, insert, update, delete on public.applications to service_role;
