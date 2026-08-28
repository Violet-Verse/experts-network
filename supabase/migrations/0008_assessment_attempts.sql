-- AI-literacy assessment: passing pays $5 via PayPal. Payouts are sent
-- manually (Melissa reviews `payout_status = 'pending_review'` rows and
-- sends the $5 through PayPal herself using the stored paypal_email), not
-- an automated API integration — a deliberate choice to keep a human
-- checkpoint before real money moves.

create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  user_id uuid not null references auth.users(id),
  email text not null,

  score integer not null,
  total_questions integer not null,
  passed boolean not null,

  paypal_email text,
  payout_status text not null default 'not_eligible', -- 'not_eligible' | 'pending_review' | 'approved' | 'paid' | 'rejected'
  reviewed_at timestamptz,
  notes text
);

create index assessment_attempts_user_id_idx on public.assessment_attempts (user_id);
create index assessment_attempts_payout_status_idx on public.assessment_attempts (payout_status);

alter table public.assessment_attempts enable row level security;

-- Writes only ever happen server-side (via the submit-assessment function,
-- using the service role key) so grading can't be spoofed from the client.
create policy "Users can view their own attempts"
  on public.assessment_attempts for select
  to authenticated
  using (auth.uid() = user_id);

grant select on public.assessment_attempts to authenticated;
grant select, insert, update, delete on public.assessment_attempts to service_role;
