import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuthenticatedUser } from "../lib/auth.js";
import { getSupabaseConfig } from "../lib/supabase.js";

interface TagInput {
  category: string;
  label: string;
}

interface ProfilePayload {
  fullName: string;
  bio: string;
  profession: string;
  yearsExperience: number | null;
  location: string;
  timeZone: string;
  languages: string[];
  portfolioLinks: string;
  tags: TagInput[];
}

const MAX_TAGS = 30;
const ALLOWED_TAG_CATEGORIES = new Set(["occupation", "skill", "industry", "domain_expertise", "task_capability"]);

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
    return res.status(401).json({ error: "You must be signed in to update your profile." });
  }

  const payload = req.body as Partial<ProfilePayload>;
  if (!payload || !isNonEmptyString(payload.fullName)) {
    return res.status(400).json({ error: "Full name is required." });
  }

  const tagsInput = Array.isArray(payload.tags) ? payload.tags : [];
  if (tagsInput.length > MAX_TAGS) {
    return res.status(400).json({ error: `Please select at most ${MAX_TAGS} tags.` });
  }
  const cleanTags: TagInput[] = [];
  const seen = new Set<string>();
  for (const t of tagsInput) {
    if (!t || !isNonEmptyString(t.category) || !isNonEmptyString(t.label)) continue;
    if (!ALLOWED_TAG_CATEGORIES.has(t.category)) continue;
    const label = t.label.trim().slice(0, 80);
    const key = `${t.category}::${label.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cleanTags.push({ category: t.category, label });
  }

  const yearsExperience =
    typeof payload.yearsExperience === "number" && Number.isFinite(payload.yearsExperience)
      ? Math.max(0, Math.round(payload.yearsExperience))
      : null;

  const languages = Array.isArray(payload.languages)
    ? payload.languages.filter(isNonEmptyString).map((l) => l.trim().slice(0, 40)).slice(0, 20)
    : [];

  const { url, serviceRoleKey } = getSupabaseConfig();
  if (!url || !serviceRoleKey) {
    return res.status(500).json({ error: "Supabase is not configured." });
  }
  const base = url.replace(/\/$/, "");
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };

  try {
    // Upsert the caller's experts row, keyed on user_id.
    const expertRes = await fetch(`${base}/rest/v1/experts?on_conflict=user_id`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        user_id: user.id,
        email: user.email,
        full_name: payload.fullName.trim().slice(0, 200),
        bio: isNonEmptyString(payload.bio) ? payload.bio.trim().slice(0, 2000) : null,
        profession: isNonEmptyString(payload.profession) ? payload.profession.trim().slice(0, 120) : null,
        years_experience: yearsExperience,
        location: isNonEmptyString(payload.location) ? payload.location.trim().slice(0, 120) : null,
        time_zone: isNonEmptyString(payload.timeZone) ? payload.timeZone.trim().slice(0, 60) : null,
        languages,
        portfolio_links: isNonEmptyString(payload.portfolioLinks) ? payload.portfolioLinks.trim().slice(0, 500) : null,
      }),
    });

    if (!expertRes.ok) {
      const body = await expertRes.text();
      console.error("Failed to upsert expert profile:", expertRes.status, body);
      return res.status(502).json({ error: "Failed to save your profile." });
    }
    const expertRows = (await expertRes.json()) as { id: string }[];
    const expertId = expertRows[0]?.id;
    if (!expertId) {
      return res.status(502).json({ error: "Failed to save your profile." });
    }

    // Resolve tags: upsert-by-(category,label) so custom, typed-in tags
    // are created on the fly and existing ones are simply matched.
    let tagIds: string[] = [];
    if (cleanTags.length > 0) {
      const tagsRes = await fetch(`${base}/rest/v1/tags?on_conflict=category,label`, {
        method: "POST",
        headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(cleanTags),
      });
      if (!tagsRes.ok) {
        const body = await tagsRes.text();
        console.error("Failed to upsert tags:", tagsRes.status, body);
        return res.status(502).json({ error: "Failed to save your skills." });
      }
      const tagRows = (await tagsRes.json()) as { id: string }[];
      tagIds = tagRows.map((t) => t.id);
    }

    // Replace this expert's tag links: clear, then re-insert the current set.
    const deleteRes = await fetch(`${base}/rest/v1/expert_tags?expert_id=eq.${expertId}`, {
      method: "DELETE",
      headers,
    });
    if (!deleteRes.ok) {
      const body = await deleteRes.text();
      console.error("Failed to clear expert tags:", deleteRes.status, body);
      return res.status(502).json({ error: "Failed to save your skills." });
    }

    if (tagIds.length > 0) {
      const linkRes = await fetch(`${base}/rest/v1/expert_tags`, {
        method: "POST",
        headers,
        body: JSON.stringify(tagIds.map((tag_id) => ({ expert_id: expertId, tag_id }))),
      });
      if (!linkRes.ok) {
        const body = await linkRes.text();
        console.error("Failed to link expert tags:", linkRes.status, body);
        return res.status(502).json({ error: "Failed to save your skills." });
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Unexpected error updating profile:", err);
    return res.status(500).json({ error: "Unexpected error. Please try again." });
  }
}
