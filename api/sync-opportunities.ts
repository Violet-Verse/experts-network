import type { VercelRequest, VercelResponse } from "@vercel/node";
import { XMLParser } from "fast-xml-parser";
import { getSupabaseConfig, isValidSupabaseUrl } from "../lib/supabase.js";
import {
  fetchHnOpportunities,
  fetchRemoteOkOpportunities,
  fetchWwrOpportunities,
} from "../lib/opportunities.js";
import type { NormalizedOpportunity } from "../lib/opportunities.js";

const xmlParser = new XMLParser({ ignoreAttributes: false });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const { url, serviceRoleKey } = getSupabaseConfig();
  const opportunitiesTable = process.env.SUPABASE_OPPORTUNITIES_TABLE || "opportunities";

  if (!url || !serviceRoleKey) {
    return res.status(500).json({ error: "Supabase is not configured." });
  }
  if (!isValidSupabaseUrl(url)) {
    return res.status(500).json({ error: "SUPABASE_URL is not a valid Supabase project API URL." });
  }

  const sources: { name: string; run: () => Promise<NormalizedOpportunity[]> }[] = [
    { name: "hn", run: fetchHnOpportunities },
    { name: "remoteok", run: fetchRemoteOkOpportunities },
    { name: "wwr", run: () => fetchWwrOpportunities((xml) => xmlParser.parse(xml)) },
  ];

  const results = await Promise.allSettled(sources.map((s) => s.run()));

  const rows: NormalizedOpportunity[] = [];
  const sourceReport: Record<string, { ok: boolean; count?: number; error?: string }> = {};

  results.forEach((result, i) => {
    const name = sources[i].name;
    if (result.status === "fulfilled") {
      sourceReport[name] = { ok: true, count: result.value.length };
      rows.push(...result.value);
    } else {
      sourceReport[name] = { ok: false, error: String(result.reason?.message ?? result.reason) };
      console.error(`Opportunity sync failed for source "${name}":`, result.reason);
    }
  });

  if (rows.length === 0) {
    return res.status(200).json({ ok: true, upserted: 0, sources: sourceReport, note: "No new AI-related listings found." });
  }

  try {
    const upsertRes = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/${opportunitiesTable}?on_conflict=source,external_id`,
      {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(rows),
      }
    );

    if (!upsertRes.ok) {
      const body = await upsertRes.text();
      console.error("Opportunity upsert failed:", upsertRes.status, body);
      return res.status(502).json({
        error: `Upsert failed (${upsertRes.status}): ${body.slice(0, 300)}`,
        sources: sourceReport,
      });
    }

    return res.status(200).json({ ok: true, upserted: rows.length, sources: sourceReport, table: opportunitiesTable });
  } catch (err) {
    console.error("Unexpected error upserting opportunities:", err);
    return res.status(500).json({ error: "Unexpected error during upsert.", sources: sourceReport });
  }
}
