import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseConfig, supabaseRequest, SupabaseConfigError } from "./lib/supabase.js";

interface Step2Payload {
  id: string;
  primaryRole: string;
  expertiseAreas: string[];
  bio: string;
  hoursPerWeek: string;
  compensationDetails: string;
  primaryIndustries: string[];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const REQUIRED_STRING_FIELDS: (keyof Step2Payload)[] = ["id", "primaryRole", "bio", "hoursPerWeek", "compensationDetails"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = req.body as Partial<Step2Payload>;

  for (const field of REQUIRED_STRING_FIELDS) {
    if (!payload || typeof payload[field] !== "string" || !(payload[field] as string).trim()) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }
  if (!UUID_RE.test(payload.id as string)) {
    return res.status(400).json({ error: "Invalid application id." });
  }
  if (!Array.isArray(payload.expertiseAreas) || payload.expertiseAreas.length !== 3) {
    return res.status(400).json({ error: "Please choose exactly 3 areas of expertise." });
  }
  if (!Array.isArray(payload.primaryIndustries) || payload.primaryIndustries.length === 0) {
    return res.status(400).json({ error: "Please select at least one primary industry." });
  }

  const { tableName } = getSupabaseConfig();

  try {
    const result = await supabaseRequest("PATCH", `/rest/v1/${tableName}?id=eq.${payload.id}`, {
      primary_role: payload.primaryRole,
      expertise_areas: payload.expertiseAreas,
      bio: payload.bio,
      hours_per_week: payload.hoursPerWeek,
      compensation_details: payload.compensationDetails,
      primary_industries: payload.primaryIndustries,
    });

    if (!result.ok) {
      console.error("Supabase step 2 update failed:", result.status, result.errorBody);
      return res.status(502).json({
        error: `Failed to save application (Supabase responded ${result.status}): ${result.errorBody.slice(0, 300)}`,
      });
    }

    const rows = result.data as unknown[];
    if (!rows.length) {
      return res.status(404).json({ error: "Application not found. Please start over from step 1." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof SupabaseConfigError) {
      console.error(err.message);
      return res.status(500).json({ error: `Application storage is misconfigured: ${err.message}` });
    }
    console.error("Unexpected error updating Supabase:", err);
    return res.status(500).json({ error: "Unexpected error. Please try again." });
  }
}
