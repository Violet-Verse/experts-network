import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseConfig, supabaseRequest, SupabaseConfigError } from "./lib/supabase.js";

interface Step1Payload {
  linkedinUrl: string;
  fullName: string;
  email: string;
}

const REQUIRED_STRING_FIELDS: (keyof Step1Payload)[] = ["linkedinUrl", "fullName", "email"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = req.body as Partial<Step1Payload>;

  for (const field of REQUIRED_STRING_FIELDS) {
    if (!payload || typeof payload[field] !== "string" || !(payload[field] as string).trim()) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  const { tableName } = getSupabaseConfig();

  try {
    const result = await supabaseRequest("POST", `/rest/v1/${tableName}`, {
      linkedin_url: payload.linkedinUrl,
      full_name: payload.fullName,
      email: payload.email,
    });

    if (!result.ok) {
      console.error("Supabase step 1 insert failed:", result.status, result.errorBody);
      return res.status(502).json({
        error: `Failed to save application (Supabase responded ${result.status}): ${result.errorBody.slice(0, 300)}`,
      });
    }

    const [record] = result.data as { id?: string }[];
    return res.status(200).json({ ok: true, id: record?.id });
  } catch (err) {
    if (err instanceof SupabaseConfigError) {
      console.error(err.message);
      return res.status(500).json({ error: `Application storage is misconfigured: ${err.message}` });
    }
    console.error("Unexpected error submitting to Supabase:", err);
    return res.status(500).json({ error: "Unexpected error. Please try again." });
  }
}
