import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuthenticatedUser } from "../lib/auth.js";
import { gradeAnswers, PASSING_SCORE } from "../lib/assessment.js";
import { getSupabaseConfig, supabaseRequest } from "../lib/supabase.js";

interface SubmitPayload {
  answers: Record<string, number>;
  paypalEmail?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getAuthenticatedUser(req.headers.authorization);
  if (!user) {
    return res.status(401).json({ error: "You must be signed in to submit the assessment." });
  }

  const payload = req.body as Partial<SubmitPayload>;
  if (!payload || typeof payload.answers !== "object" || payload.answers === null) {
    return res.status(400).json({ error: "Missing answers." });
  }

  const { score, total } = gradeAnswers(payload.answers as Record<string, number>);
  const passed = score >= PASSING_SCORE;

  let paypalEmail: string | null = null;
  if (passed) {
    if (typeof payload.paypalEmail !== "string" || !EMAIL_RE.test(payload.paypalEmail.trim())) {
      return res.status(400).json({ error: "A valid PayPal email is required to claim your $5." });
    }
    paypalEmail = payload.paypalEmail.trim();
  }

  const { url, serviceRoleKey } = getSupabaseConfig();
  if (!url || !serviceRoleKey) {
    return res.status(500).json({ error: "Supabase is not configured." });
  }

  try {
    // One reward per person: if they already have a prior attempt in the
    // payout pipeline, still grade this attempt for feedback but don't
    // create a second payable row.
    const priorCheck = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/assessment_attempts?user_id=eq.${user.id}&payout_status=in.(pending_review,approved,paid)&select=id`,
      { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
    );
    const priorRows = priorCheck.ok ? ((await priorCheck.json()) as unknown[]) : [];
    const alreadyRewarded = priorRows.length > 0;

    const payoutStatus = passed && !alreadyRewarded ? "pending_review" : "not_eligible";

    const result = await supabaseRequest("POST", "/rest/v1/assessment_attempts", {
      user_id: user.id,
      email: user.email,
      score,
      total_questions: total,
      passed,
      paypal_email: paypalEmail,
      payout_status: payoutStatus,
    });

    if (!result.ok) {
      console.error("Failed to record assessment attempt:", result.status, result.errorBody);
      return res.status(502).json({ error: "Failed to save your assessment result." });
    }

    return res.status(200).json({
      ok: true,
      score,
      total,
      passed,
      rewardPending: payoutStatus === "pending_review",
      alreadyRewarded: passed && alreadyRewarded,
    });
  } catch (err) {
    console.error("Unexpected error submitting assessment:", err);
    return res.status(500).json({ error: "Unexpected error. Please try again." });
  }
}
