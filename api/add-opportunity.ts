import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuthenticatedUser } from "../lib/auth.js";
import { getSupabaseConfig, supabaseRequest } from "../lib/supabase.js";

interface AddOpportunityPayload {
  title: string;
  company: string;
  url: string;
  type: string;
  source: string;
  tags: string; // comma-separated, split server-side
  description: string;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getAuthenticatedUser(req.headers.authorization);
  if (!user) {
    return res.status(401).json({ error: "You must be signed in." });
  }

  const { url, serviceRoleKey } = getSupabaseConfig();
  if (!url || !serviceRoleKey) {
    return res.status(500).json({ error: "Supabase is not configured." });
  }

  // Never trust a client-side-only gate for something that writes shared,
  // public content — re-check admin role server-side against the same
  // contributors table the dashboard itself reads.
  const roleCheck = await fetch(
    `${url.replace(/\/$/, "")}/rest/v1/contributors?email=eq.${encodeURIComponent(user.email)}&select=role`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
  );
  const roleRows = roleCheck.ok ? ((await roleCheck.json()) as { role: string }[]) : [];
  if (roleRows[0]?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }

  const payload = req.body as Partial<AddOpportunityPayload>;
  if (!payload || !isNonEmptyString(payload.title) || !isNonEmptyString(payload.source)) {
    return res.status(400).json({ error: "Title and source are required." });
  }

  const tags = isNonEmptyString(payload.tags)
    ? payload.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  try {
    const result = await supabaseRequest("POST", "/rest/v1/opportunities", {
      source: payload.source.trim(),
      external_id: null,
      type: isNonEmptyString(payload.type) ? payload.type.trim() : "job",
      title: payload.title.trim(),
      company: isNonEmptyString(payload.company) ? payload.company.trim() : null,
      description: isNonEmptyString(payload.description) ? payload.description.trim() : null,
      url: isNonEmptyString(payload.url) ? payload.url.trim() : null,
      tags,
      location: null,
      remote: null,
      posted_at: new Date().toISOString(),
    });

    if (!result.ok) {
      console.error("Failed to add opportunity:", result.status, result.errorBody);
      return res.status(502).json({ error: "Failed to add opportunity." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Unexpected error adding opportunity:", err);
    return res.status(500).json({ error: "Unexpected error. Please try again." });
  }
}
