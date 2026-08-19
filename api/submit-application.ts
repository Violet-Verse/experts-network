import type { VercelRequest, VercelResponse } from "@vercel/node";

interface ApplicationPayload {
  primaryRole: string;
  expertiseAreas: string[];
  bio: string;
  portfolioLinks: string;
  preferredProjectTypes: string[];
  primaryIndustries: string[];
  hoursPerWeek: string;
  preferredContractLength: string;
  compensationType: string;
  compensationDetails: string;
  futureOpportunities: string;
  companiesWorkedWith: string;
  aiExperience: string;
  technicalSkills: string;
  languages: string;
  researchMethods: string;
  specializations: string[];
  excitingProjects: string;
  deepIndustries: string;
  longTermInterest: string;
  remoteOnly: string;
  timeZone: string;
  earliestAvailability: string;
  fullName: string;
  email: string;
}

const REQUIRED_STRING_FIELDS: (keyof ApplicationPayload)[] = ["fullName", "email", "primaryRole", "bio"];

function toSupabaseRow(payload: ApplicationPayload) {
  return {
    full_name: payload.fullName,
    email: payload.email,
    primary_role: payload.primaryRole,
    expertise_areas: payload.expertiseAreas || [],
    bio: payload.bio,
    portfolio_links: payload.portfolioLinks || null,
    preferred_project_types: payload.preferredProjectTypes || [],
    primary_industries: payload.primaryIndustries || [],
    hours_per_week: payload.hoursPerWeek ? Number(payload.hoursPerWeek) : null,
    preferred_contract_length: payload.preferredContractLength || null,
    compensation_type: payload.compensationType || null,
    compensation_details: payload.compensationDetails || null,
    future_opportunities: payload.futureOpportunities || null,
    companies_worked_with: payload.companiesWorkedWith || null,
    ai_experience: payload.aiExperience || null,
    technical_skills: payload.technicalSkills || null,
    languages: payload.languages || null,
    research_methods: payload.researchMethods || null,
    specializations: payload.specializations || [],
    exciting_projects: payload.excitingProjects || null,
    deep_industries: payload.deepIndustries || null,
    long_term_interest: payload.longTermInterest || null,
    remote_only: payload.remoteOnly || null,
    time_zone: payload.timeZone || null,
    earliest_availability: payload.earliestAvailability || null,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = req.body as Partial<ApplicationPayload>;

  for (const field of REQUIRED_STRING_FIELDS) {
    if (!payload || typeof payload[field] !== "string" || !(payload[field] as string).trim()) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tableName = process.env.SUPABASE_TABLE_NAME || "applications";

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Supabase is not configured: missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({
      error: "Application storage isn't configured yet. Please try again later.",
    });
  }

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(supabaseUrl)) {
    console.error("SUPABASE_URL does not look like a Supabase project API URL:", supabaseUrl);
    return res.status(500).json({
      error: `Application storage is misconfigured: SUPABASE_URL is set to "${supabaseUrl}", which is not a valid Supabase project API URL (expected https://<project-ref>.supabase.co). This is likely the dashboard URL instead of the Project URL from Settings > API.`,
    });
  }

  try {
    const supabaseRes = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${tableName}`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(toSupabaseRow(payload as ApplicationPayload)),
    });

    if (!supabaseRes.ok) {
      const errorBody = await supabaseRes.text();
      console.error("Supabase submission failed:", supabaseRes.status, errorBody);
      return res.status(502).json({
        error: `Failed to save application (Supabase responded ${supabaseRes.status}): ${errorBody.slice(0, 300)}`,
      });
    }

    const [record] = await supabaseRes.json();
    return res.status(200).json({ ok: true, id: record?.id });
  } catch (err) {
    console.error("Unexpected error submitting to Supabase:", err);
    return res.status(500).json({ error: "Unexpected error. Please try again." });
  }
}
