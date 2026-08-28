-- Every new Supabase Auth user automatically becomes a 'contributor' so
-- they see the dashboard right after creating an account, with no manual
-- approval step. This intentionally drops the earlier "Melissa manually
-- adds approved emails" gate in favor of open self-serve access.
--
-- security definer is required: the trigger fires as part of the auth.users
-- insert (run by Supabase's internal auth role), which has no grants on
-- public.contributors. Running as the function owner (postgres) lets it
-- write regardless of who triggered the insert.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.contributors (email, role)
  values (new.email, 'contributor')
  on conflict (email) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
