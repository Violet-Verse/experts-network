import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { Assessment } from "./Assessment";
import { Profile } from "./Profile";
import { AdminAddOpportunity } from "./AdminAddOpportunity";

interface Opportunity {
  id: string;
  source: string;
  type: string;
  title: string;
  company: string | null;
  description: string | null;
  url: string | null;
  tags: string[];
  location: string | null;
  remote: boolean | null;
  posted_at: string | null;
}

const SOURCE_LABELS: Record<string, string> = {
  hn: "Hacker News",
  remoteok: "RemoteOK",
  wwr: "We Work Remotely",
  verso: "Verso Network",
};

export function Dashboard({ session, role }: { session: Session; role?: string }) {
  const [view, setView] = useState<"opportunities" | "assessment" | "profile" | "admin">(
    "opportunities"
  );
  const [opportunities, setOpportunities] = useState<Opportunity[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myTagLabels, setMyTagLabels] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("opportunities")
      .select("*")
      .order("posted_at", { ascending: false, nullsFirst: false })
      .limit(100)
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError(fetchError.message);
          return;
        }
        setOpportunities(data as Opportunity[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadMyTags() {
      const { data: expert } = await supabase
        .from("experts")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (cancelled || !expert) return;
      const { data: links } = await supabase
        .from("expert_tags")
        .select("tags(label)")
        .eq("expert_id", (expert as { id: string }).id);
      if (cancelled || !links) return;
      const rows = links as unknown as { tags: { label: string } | null }[];
      setMyTagLabels(new Set(rows.filter((r) => r.tags).map((r) => r.tags!.label.toLowerCase())));
    }
    loadMyTags();
    return () => {
      cancelled = true;
    };
  }, [session.user.id, view]);

  const internal = opportunities?.filter((o) => o.source === "verso") ?? [];
  const external = opportunities?.filter((o) => o.source !== "verso") ?? [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Verso Network</span>
          <h1>Opportunities</h1>
          <p className="section-sub">Signed in as {session.user.email}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
      </div>

      <div
        className="login-mode-toggle"
        style={{ maxWidth: 560, marginBottom: 24, flexWrap: "wrap" }}
      >
        <button
          type="button"
          className={view === "opportunities" ? "active" : ""}
          onClick={() => setView("opportunities")}
        >
          Opportunities
        </button>
        <button
          type="button"
          className={view === "assessment" ? "active" : ""}
          onClick={() => setView("assessment")}
        >
          Assessment ($5)
        </button>
        <button
          type="button"
          className={view === "profile" ? "active" : ""}
          onClick={() => setView("profile")}
        >
          Profile
        </button>
        {role === "admin" && (
          <button
            type="button"
            className={view === "admin" ? "active" : ""}
            onClick={() => setView("admin")}
          >
            Add Opportunity
          </button>
        )}
      </div>

      {view === "assessment" && <Assessment session={session} />}
      {view === "profile" && <Profile session={session} />}
      {view === "admin" && role === "admin" && <AdminAddOpportunity session={session} />}
      {view === "opportunities" && (
        <>
          {error && <p className="error-text">Couldn't load opportunities: {error}</p>}
          {opportunities === null && !error && (
            <p className="section-sub">Loading opportunities…</p>
          )}

          {internal.length > 0 && (
            <div className="form-section">
              <h2 style={{ fontSize: 20 }}>From Verso Network</h2>
              <div className="opportunity-list">
                {internal.map((o) => (
                  <OpportunityCard key={o.id} opportunity={o} myTagLabels={myTagLabels} />
                ))}
              </div>
            </div>
          )}

          {external.length > 0 && (
            <div className="form-section">
              <h2 style={{ fontSize: 20 }}>In the AI Space</h2>
              <div className="opportunity-list">
                {external.map((o) => (
                  <OpportunityCard key={o.id} opportunity={o} myTagLabels={myTagLabels} />
                ))}
              </div>
            </div>
          )}

          {opportunities !== null && opportunities.length === 0 && (
            <p className="section-sub">No opportunities yet — check back soon.</p>
          )}
        </>
      )}
    </div>
  );
}

function OpportunityCard({
  opportunity,
  myTagLabels,
}: {
  opportunity: Opportunity;
  myTagLabels: Set<string>;
}) {
  const posted = opportunity.posted_at
    ? new Date(opportunity.posted_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  const matchCount = opportunity.tags.filter((t) => myTagLabels.has(t.toLowerCase())).length;

  return (
    <a
      className="opportunity-card"
      href={opportunity.url ?? undefined}
      target="_blank"
      rel="noreferrer"
    >
      <div className="opportunity-card-top">
        <span className="opportunity-source">{SOURCE_LABELS[opportunity.source] ?? opportunity.source}</span>
        {posted && <span className="opportunity-date">{posted}</span>}
      </div>
      {matchCount > 0 && (
        <span className="opportunity-match-badge">
          {matchCount} skill match{matchCount > 1 ? "es" : ""}
        </span>
      )}
      <h3>{opportunity.title}</h3>
      {opportunity.company && <p className="opportunity-company">{opportunity.company}</p>}
      {opportunity.description && (
        <p className="opportunity-desc">{opportunity.description.slice(0, 160)}</p>
      )}
      {opportunity.tags.length > 0 && (
        <div className="opportunity-tags">
          {opportunity.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="opportunity-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
