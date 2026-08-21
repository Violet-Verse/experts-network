# Verso Network — Application

A job intelligence service for the world's most dynamic creators, matching them with
companies and projects built on ethical data capture.

The form covers:

- **Part 1 — Expertise & Network Fit**: primary role, three areas of expertise, bio,
  portfolio, preferred project types, industries, availability, compensation, future
  opportunities.
- **Part 2 — Experience**: companies, AI experience, technical skills, languages,
  research methods.
- **Part 3 — Specializations**: checkbox grid of specialization areas.
- **Part 4 — Matching**: project interests, deep industries, long-term collaboration
  interest, remote preference, time zone, availability, and contact info.

## Stack

- [Vite](https://vitejs.dev/) + React + TypeScript for the front end.
- A single serverless function (`api/submit-application.ts`, Vercel Node runtime) that
  validates the submission and forwards it to a [Supabase](https://supabase.com/)
  Postgres table.

## Local development

```bash
npm install
npm run dev
```

The form runs at `http://localhost:5173`. The `/api/submit-application` endpoint only
works when deployed on Vercel (or run via `vercel dev`), since it's a serverless
function — see below.

## Connecting Supabase

Submissions are stored in a Supabase table. To wire this up:

1. Create a Supabase project, then run `supabase/schema.sql` followed by the files in
   `supabase/migrations/` (in order) in the SQL editor (Dashboard → SQL Editor → New
   query) to create the `Expert_Network` table. Row level security is enabled with no
   policies, so only the service role key can read/write it — the anon/public key has
   no access.

2. Grab the values from Project Settings → API:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (not the anon key — this one bypasses RLS and must stay
     server-side only) → `SUPABASE_SERVICE_ROLE_KEY`

3. Copy `.env.example` to `.env.local` (for `vercel dev`) or set these as environment
   variables in your hosting provider:

   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_TABLE_NAME=Expert_Network
   ```

Until these are set, submissions will fail with a friendly error and the failure is
logged server-side — nothing is silently dropped.

`data/applications-template.csv` documents the same schema as a flat CSV (one header
row + one example row) — useful as a reference for what's being collected, or for
manual exports/imports outside of Supabase.

## Deployment

Deploy to [Vercel](https://vercel.com/) (or any host that supports a Vite front end
plus a Node serverless function at `/api/submit-application`). No additional build
configuration is required beyond the environment variables above.
