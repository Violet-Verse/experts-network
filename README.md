# Experts Network — Application

A multi-step application form for the Experts Network: matching contributors to future
paid research, AI evaluation, and content opportunities.

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
  validates the submission and forwards it to an Airtable base.

## Local development

```bash
npm install
npm run dev
```

The form runs at `http://localhost:5173`. The `/api/submit-application` endpoint only
works when deployed on Vercel (or run via `vercel dev`), since it's a serverless
function — see below.

## Connecting Airtable

Submissions are stored in Airtable. To wire this up:

1. Create an Airtable base with a table (default name: `Applications`) containing these
   fields (all plain text/long text is fine — the API sends everything as strings,
   including multi-select answers joined with `, `):

   `Full Name`, `Email`, `Primary Role`, `Areas of Expertise`, `Bio`, `Portfolio`,
   `Preferred Project Types`, `Primary Industries`, `Hours Per Week`,
   `Preferred Contract Length`, `Compensation Type`, `Compensation Details`,
   `Future Opportunities`, `Companies Worked With`, `AI Experience`,
   `Technical Skills`, `Languages`, `Research Methods`, `Specializations`,
   `Exciting Projects`, `Deep Industries`, `Long-Term Interest`, `Remote Only`,
   `Time Zone`, `Earliest Availability`.

2. Create a [Personal Access Token](https://airtable.com/create/tokens) scoped to
   `data.records:write` with access to that base.

3. Copy `.env.example` to `.env.local` (for `vercel dev`) or set these as environment
   variables in your hosting provider:

   ```
   AIRTABLE_API_KEY=your_token
   AIRTABLE_BASE_ID=your_base_id
   AIRTABLE_TABLE_NAME=Applications
   ```

Until these are set, submissions will fail with a friendly error and the failure is
logged server-side — nothing is silently dropped.

## Deployment

Deploy to [Vercel](https://vercel.com/) (or any host that supports a Vite front end
plus a Node serverless function at `/api/submit-application`). No additional build
configuration is required beyond the environment variables above.
