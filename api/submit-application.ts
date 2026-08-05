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

function toAirtableFields(payload: ApplicationPayload) {
  return {
    "Full Name": payload.fullName,
    Email: payload.email,
    "Primary Role": payload.primaryRole,
    "Areas of Expertise": (payload.expertiseAreas || []).join(", "),
    Bio: payload.bio,
    Portfolio: payload.portfolioLinks,
    "Preferred Project Types": (payload.preferredProjectTypes || []).join(", "),
    "Primary Industries": (payload.primaryIndustries || []).join(", "),
    "Hours Per Week": payload.hoursPerWeek,
    "Preferred Contract Length": payload.preferredContractLength,
    "Compensation Type": payload.compensationType,
    "Compensation Details": payload.compensationDetails,
    "Future Opportunities": payload.futureOpportunities,
    "Companies Worked With": payload.companiesWorkedWith,
    "AI Experience": payload.aiExperience,
    "Technical Skills": payload.technicalSkills,
    Languages: payload.languages,
    "Research Methods": payload.researchMethods,
    Specializations: (payload.specializations || []).join(", "),
    "Exciting Projects": payload.excitingProjects,
    "Deep Industries": payload.deepIndustries,
    "Long-Term Interest": payload.longTermInterest,
    "Remote Only": payload.remoteOnly,
    "Time Zone": payload.timeZone,
    "Earliest Availability": payload.earliestAvailability || undefined,
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

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME || "Applications";

  if (!apiKey || !baseId) {
    console.error("Airtable is not configured: missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID");
    return res.status(500).json({
      error: "Application storage isn't configured yet. Please try again later.",
    });
  }

  try {
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: toAirtableFields(payload as ApplicationPayload),
        }),
      }
    );

    if (!airtableRes.ok) {
      const errorBody = await airtableRes.text();
      console.error("Airtable submission failed:", airtableRes.status, errorBody);
      return res.status(502).json({ error: "Failed to save application. Please try again." });
    }

    const record = await airtableRes.json();
    return res.status(200).json({ ok: true, id: record.id });
  } catch (err) {
    console.error("Unexpected error submitting to Airtable:", err);
    return res.status(500).json({ error: "Unexpected error. Please try again." });
  }
}
