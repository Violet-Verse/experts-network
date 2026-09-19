-- Activates the experts/tags/expert_tags schema from 0005 (built for "the
-- Expert Verification + Profile form... once it exists" — this is that
-- form). Links it to the actual signed-in identity, opens it up for
-- self-service profile + skill tagging, and seeds a broad starting
-- vocabulary so the tag picker isn't empty on day one.

-- Link experts rows to the authenticated user. application_id (added in
-- 0005) stays separate and nullable — someone can have a profile without
-- ever having submitted an application.
alter table public.experts add column if not exists user_id uuid references auth.users(id) unique;

-- Every write in this app that touches sensitive/validated data goes
-- through a service-role API route (assessment_attempts, opportunities),
-- not direct client writes. Keep that discipline here too: only add SELECT
-- policies for a user's own data, no client-side insert/update.
create policy "Users can view their own expert profile"
  on public.experts for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can view their own expert tags"
  on public.expert_tags for select
  to authenticated
  using (
    exists (
      select 1 from public.experts e
      where e.id = expert_tags.expert_id and e.user_id = auth.uid()
    )
  );

-- The tag catalog itself isn't sensitive — open it up for reading so the
-- picker UI and the opportunity-match indicator can query it directly.
-- New tags are still only ever inserted server-side (via the service role,
-- from api/update-profile.ts), never by the client.
create policy "Authenticated users can view tags"
  on public.tags for select
  to authenticated
  using (true);

grant select on public.experts to authenticated;
grant select on public.expert_tags to authenticated;
grant select on public.tags to authenticated;

-- Seed vocabulary. category values: 'occupation' | 'skill' | 'industry'
-- (domain_expertise' and 'task_capability' from 0005's comment are left
-- for later use). "Other" entries from src/formConfig.ts are intentionally
-- not seeded here — the profile picker's custom-tag entry covers that case
-- properly instead of a meaningless literal "Other" tag.

insert into public.tags (category, label) values
  -- Niche creative crafts (the audience Melissa specifically wants to attract)
  ('occupation', 'Photographer'),
  ('occupation', 'Author'),
  ('occupation', 'Novelist'),
  ('occupation', 'Journalist'),
  ('occupation', 'Editor'),
  ('occupation', 'Illustrator'),
  ('occupation', 'Graphic Designer'),
  ('occupation', 'Filmmaker'),
  ('occupation', 'Video Editor'),
  ('occupation', 'Documentary Producer'),
  ('occupation', 'Musician'),
  ('occupation', 'Composer'),
  ('occupation', 'Music Producer'),
  ('occupation', 'Podcaster'),
  ('occupation', 'Voice Actor'),
  ('occupation', 'Actor'),
  ('occupation', 'Screenwriter'),
  ('occupation', 'Playwright'),
  ('occupation', 'Poet'),
  ('occupation', 'Blogger'),
  ('occupation', 'Content Creator'),
  ('occupation', 'Influencer'),
  ('occupation', 'Event Producer'),
  ('occupation', 'Festival Producer'),
  ('occupation', 'Concert Promoter'),
  ('occupation', 'Talent Manager'),
  ('occupation', 'Art Director'),
  ('occupation', 'Fashion Designer'),
  ('occupation', 'Fashion Stylist'),
  ('occupation', 'Makeup Artist'),
  ('occupation', 'Hair Stylist'),
  ('occupation', 'Interior Designer'),
  ('occupation', 'Architect'),
  ('occupation', 'Sculptor'),
  ('occupation', 'Painter'),
  ('occupation', 'Animator'),
  ('occupation', 'Game Designer'),
  ('occupation', 'Sound Engineer'),
  ('occupation', 'Choreographer'),
  ('occupation', 'Dancer'),

  -- Marketing / media / growth
  ('occupation', 'Paid Media Buyer'),
  ('occupation', 'Growth Marketer'),
  ('occupation', 'Performance Marketer'),
  ('occupation', 'Social Media Manager'),
  ('occupation', 'Community Manager'),
  ('occupation', 'Brand Strategist'),
  ('occupation', 'Copywriter'),
  ('occupation', 'SEO Specialist'),
  ('occupation', 'Email Marketer'),
  ('occupation', 'Affiliate Marketer'),
  ('occupation', 'PR Specialist'),
  ('occupation', 'Product Marketer'),
  ('occupation', 'Marketing Analyst'),
  ('occupation', 'Media Planner'),

  -- Tech / AI
  ('occupation', 'Software Engineer'),
  ('occupation', 'Data Scientist'),
  ('occupation', 'Machine Learning Engineer'),
  ('occupation', 'AI Researcher'),
  ('occupation', 'Data Engineer'),
  ('occupation', 'DevOps Engineer'),
  ('occupation', 'Product Manager'),
  ('occupation', 'UX Designer'),
  ('occupation', 'UX Researcher'),
  ('occupation', 'UI Designer'),
  ('occupation', 'QA Engineer'),
  ('occupation', 'Security Engineer'),
  ('occupation', 'Solutions Architect'),
  ('occupation', 'Technical Writer'),
  ('occupation', 'Developer Relations Engineer'),
  ('occupation', 'Prompt Engineer'),

  -- Business / finance
  ('occupation', 'Accountant'),
  ('occupation', 'Financial Analyst'),
  ('occupation', 'Investment Banker'),
  ('occupation', 'Management Consultant'),
  ('occupation', 'Business Analyst'),
  ('occupation', 'Operations Manager'),
  ('occupation', 'Project Manager'),
  ('occupation', 'Supply Chain Manager'),
  ('occupation', 'HR Manager'),
  ('occupation', 'Recruiter'),
  ('occupation', 'Sales Representative'),
  ('occupation', 'Account Executive'),
  ('occupation', 'Customer Success Manager'),
  ('occupation', 'Entrepreneur'),
  ('occupation', 'Founder'),
  ('occupation', 'Venture Capitalist'),
  ('occupation', 'Real Estate Agent'),
  ('occupation', 'Insurance Agent'),
  ('occupation', 'Bookkeeper'),
  ('occupation', 'Auditor'),

  -- Legal / policy
  ('occupation', 'Lawyer'),
  ('occupation', 'Paralegal'),
  ('occupation', 'Policy Analyst'),
  ('occupation', 'Compliance Officer'),
  ('occupation', 'Legal Consultant'),

  -- Healthcare
  ('occupation', 'Doctor'),
  ('occupation', 'Nurse'),
  ('occupation', 'Physician Assistant'),
  ('occupation', 'Dentist'),
  ('occupation', 'Pharmacist'),
  ('occupation', 'Psychologist'),
  ('occupation', 'Therapist'),
  ('occupation', 'Physical Therapist'),
  ('occupation', 'Nutritionist'),
  ('occupation', 'Veterinarian'),
  ('occupation', 'Paramedic'),
  ('occupation', 'Medical Researcher'),

  -- Education
  ('occupation', 'Teacher'),
  ('occupation', 'Professor'),
  ('occupation', 'Tutor'),
  ('occupation', 'School Administrator'),
  ('occupation', 'Curriculum Designer'),
  ('occupation', 'Instructional Designer'),

  -- Science / engineering
  ('occupation', 'Civil Engineer'),
  ('occupation', 'Mechanical Engineer'),
  ('occupation', 'Electrical Engineer'),
  ('occupation', 'Chemical Engineer'),
  ('occupation', 'Biologist'),
  ('occupation', 'Chemist'),
  ('occupation', 'Physicist'),
  ('occupation', 'Environmental Scientist'),
  ('occupation', 'Urban Planner'),
  ('occupation', 'Researcher'),

  -- Skilled trades / services
  ('occupation', 'Chef'),
  ('occupation', 'Baker'),
  ('occupation', 'Sommelier'),
  ('occupation', 'Bartender'),
  ('occupation', 'Personal Trainer'),
  ('occupation', 'Yoga Instructor'),
  ('occupation', 'Massage Therapist'),
  ('occupation', 'Electrician'),
  ('occupation', 'Plumber'),
  ('occupation', 'Carpenter'),
  ('occupation', 'Contractor'),
  ('occupation', 'Pilot'),
  ('occupation', 'Flight Attendant'),
  ('occupation', 'Travel Agent'),
  ('occupation', 'Tour Guide'),
  ('occupation', 'Translator'),
  ('occupation', 'Interpreter'),

  -- Public service / nonprofit
  ('occupation', 'Nonprofit Program Manager'),
  ('occupation', 'Grant Writer'),
  ('occupation', 'Fundraiser'),
  ('occupation', 'Social Worker'),
  ('occupation', 'Librarian'),
  ('occupation', 'Diplomat'),
  ('occupation', 'Public Servant')
on conflict (category, label) do nothing;

-- Skills: migrated from src/formConfig.ts's EXPERTISE_AREA_OPTIONS (minus
-- "Other"), plus additions covering the specific, concrete examples
-- Melissa gave ("I write briefs," "paid media for crypto," "can produce a
-- concert or festival") so the seed list isn't only AI-research-shaped.
insert into public.tags (category, label) values
  ('skill', 'AI Evaluation'),
  ('skill', 'RLHF'),
  ('skill', 'Prompt Engineering'),
  ('skill', 'Technical Writing'),
  ('skill', 'Product Marketing'),
  ('skill', 'Developer Relations'),
  ('skill', 'UX Research'),
  ('skill', 'Cultural Research'),
  ('skill', 'Data Annotation'),
  ('skill', 'Content Strategy'),
  ('skill', 'Copywriting'),
  ('skill', 'Data Science'),
  ('skill', 'Fintech'),
  ('skill', 'Blockchain'),
  ('skill', 'Policy'),
  ('skill', 'Paid Media (Crypto)'),
  ('skill', 'Brief Writing'),
  ('skill', 'Event Production'),
  ('skill', 'Festival Production'),
  ('skill', 'Photography'),
  ('skill', 'Videography'),
  ('skill', 'Voiceover'),
  ('skill', 'Community Building'),
  ('skill', 'Fundraising'),
  ('skill', 'Grant Writing'),
  ('skill', 'Public Speaking'),
  ('skill', 'Podcast Production'),
  ('skill', 'Newsletter Writing'),
  ('skill', 'Ghostwriting'),
  ('skill', 'Translation')
on conflict (category, label) do nothing;

-- Industries: migrated from src/formConfig.ts's INDUSTRY_OPTIONS (minus
-- "Other"), plus a few more relevant to the niche-creator audience.
insert into public.tags (category, label) values
  ('industry', 'Fintech'),
  ('industry', 'AI'),
  ('industry', 'Crypto'),
  ('industry', 'Fashion'),
  ('industry', 'Beauty'),
  ('industry', 'Travel'),
  ('industry', 'Media'),
  ('industry', 'Healthcare'),
  ('industry', 'Enterprise SaaS'),
  ('industry', 'Entertainment'),
  ('industry', 'Music'),
  ('industry', 'Publishing'),
  ('industry', 'Nonprofit'),
  ('industry', 'Real Estate'),
  ('industry', 'Education'),
  ('industry', 'Gaming'),
  ('industry', 'Sports')
on conflict (category, label) do nothing;
