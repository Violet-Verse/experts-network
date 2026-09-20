import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

interface ExpertRow {
  id: string;
  full_name: string;
  bio: string | null;
  profession: string | null;
  years_experience: number | null;
  location: string | null;
  time_zone: string | null;
  languages: string[];
  portfolio_links: string | null;
}

interface TagRow {
  id: string;
  category: string;
  label: string;
}

interface SelectedTag {
  category: string;
  label: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  occupation: "Occupation",
  skill: "Skills",
  industry: "Industry",
  domain_expertise: "Domain Expertise",
  task_capability: "Task Capability",
};

const COMPLETENESS_FIELD_COUNT = 8; // fullName, profession, bio, location, timeZone, portfolioLinks, yearsExperience, tags

export function Profile({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<TagRow[]>([]);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [profession, setProfession] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [location, setLocation] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [languages, setLanguages] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [profileSharing, setProfileSharing] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [{ data: expert }, { data: tags }, { data: consents }] = await Promise.all([
        supabase.from("experts").select("*").eq("user_id", session.user.id).maybeSingle(),
        supabase.from("tags").select("*").order("category").order("label"),
        supabase
          .from("consents")
          .select("consent_type, granted")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;

      if (tags) setCatalog(tags as TagRow[]);

      if (consents) {
        const rows = consents as { consent_type: string; granted: boolean }[];
        // Rows come back newest-first, so the first occurrence of each
        // type is its current value.
        const latest = new Map<string, boolean>();
        for (const r of rows) {
          if (!latest.has(r.consent_type)) latest.set(r.consent_type, r.granted);
        }
        setProfileSharing(latest.get("profile_sharing") ?? false);
        setMarketingEmails(latest.get("marketing_emails") ?? false);
      }

      if (expert) {
        const e = expert as ExpertRow;
        setFullName(e.full_name ?? "");
        setBio(e.bio ?? "");
        setProfession(e.profession ?? "");
        setYearsExperience(e.years_experience != null ? String(e.years_experience) : "");
        setLocation(e.location ?? "");
        setTimeZone(e.time_zone ?? "");
        setLanguages((e.languages ?? []).join(", "));
        setPortfolioLinks(e.portfolio_links ?? "");

        const { data: links } = await supabase
          .from("expert_tags")
          .select("tags(category, label)")
          .eq("expert_id", e.id);
        if (!cancelled && links) {
          const rows = links as unknown as { tags: { category: string; label: string } | null }[];
          setSelectedTags(
            rows.filter((r) => r.tags).map((r) => ({ category: r.tags!.category, label: r.tags!.label }))
          );
        }
      } else {
        // No profile yet — default the name field from their account email
        // so the form isn't blank, still editable.
        setFullName(session.user.email?.split("@")[0] ?? "");
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [session.user.id, session.user.email]);

  const filteredOptions = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    const selectedKeys = new Set(selectedTags.map((t) => `${t.category}::${t.label.toLowerCase()}`));
    return catalog
      .filter((t) => !selectedKeys.has(`${t.category}::${t.label.toLowerCase()}`))
      .filter((t) => (q ? t.label.toLowerCase().includes(q) : false))
      .slice(0, 12);
  }, [catalog, tagQuery, selectedTags]);

  const exactMatchExists = useMemo(
    () => catalog.some((t) => t.label.toLowerCase() === tagQuery.trim().toLowerCase()),
    [catalog, tagQuery]
  );

  const addTag = (tag: SelectedTag) => {
    setSelectedTags((prev) =>
      prev.some((t) => t.category === tag.category && t.label.toLowerCase() === tag.label.toLowerCase())
        ? prev
        : [...prev, tag]
    );
    setTagQuery("");
  };

  const removeTag = (tag: SelectedTag) => {
    setSelectedTags((prev) => prev.filter((t) => !(t.category === tag.category && t.label === tag.label)));
  };

  const completeness = useMemo(() => {
    const filled = [
      fullName,
      profession,
      bio,
      location,
      timeZone,
      portfolioLinks,
      yearsExperience,
      selectedTags.length > 0 ? "x" : "",
    ].filter((v) => v.trim().length > 0).length;
    return { filled, total: COMPLETENESS_FIELD_COUNT };
  }, [fullName, profession, bio, location, timeZone, portfolioLinks, yearsExperience, selectedTags.length]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      setStatus("error");
      setError("Full name is required.");
      return;
    }
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          bio,
          profession,
          yearsExperience: yearsExperience.trim() ? Number(yearsExperience) : null,
          location,
          timeZone,
          languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
          portfolioLinks,
          tags: selectedTags,
          profileSharing,
          marketingEmails,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Something went wrong saving your profile.");
        return;
      }
      setStatus("saved");
    } catch {
      setStatus("error");
      setError("Something went wrong saving your profile. Please try again.");
    }
  };

  if (loading) {
    return <p className="section-sub">Loading your profile…</p>;
  }

  const groupedSelected = selectedTags.reduce<Record<string, SelectedTag[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="form-section">
      <h2 style={{ fontSize: 20 }}>Your Profile</h2>
      <p className="section-sub">
        Tell us who you are and what you can actually do — this is what we'll use to match you to
        opportunities as we build that out.
      </p>

      <div className="profile-progress-bar">
        <div
          className="profile-progress-fill"
          style={{ width: `${Math.round((completeness.filled / completeness.total) * 100)}%` }}
        />
      </div>
      <p className="section-sub" style={{ marginTop: 6, marginBottom: 24 }}>
        {completeness.filled}/{completeness.total} complete
      </p>

      <div className="card span-2" style={{ marginBottom: 20 }}>
        <label className="card-title">Privacy & Data Use</label>
        <p className="card-hint">
          Creating an account or a profile here never means your data is used to train or evaluate
          AI models. That only ever happens for a specific project you individually submit work
          for, with its own separate agreement at that time — nothing on this page covers that.
        </p>
        <div className="chip-group" style={{ marginTop: 10 }}>
          <button
            type="button"
            className={`chip${profileSharing ? " selected" : ""}`}
            onClick={() => setProfileSharing((v) => !v)}
          >
            {profileSharing ? "✓ " : ""}Share my profile with matched companies
          </button>
          <button
            type="button"
            className={`chip${marketingEmails ? " selected" : ""}`}
            onClick={() => setMarketingEmails((v) => !v)}
          >
            {marketingEmails ? "✓ " : ""}Email me about new opportunities
          </button>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <label className="card-title">Full Name</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="card">
          <label className="card-title">Profession / Occupation</label>
          <input
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="e.g. Photographer, Growth Marketer"
          />
        </div>
        <div className="card">
          <label className="card-title">Years of Experience</label>
          <input
            type="number"
            min={0}
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
          />
        </div>
        <div className="card">
          <label className="card-title">Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="card">
          <label className="card-title">Time Zone</label>
          <input
            type="text"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            placeholder="e.g. Eastern Time (US)"
          />
        </div>
        <div className="card">
          <label className="card-title">Languages</label>
          <input
            type="text"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="Comma-separated, e.g. English, Spanish"
          />
        </div>
        <div className="card span-2">
          <label className="card-title">Portfolio / Links</label>
          <input
            type="text"
            value={portfolioLinks}
            onChange={(e) => setPortfolioLinks(e.target.value)}
            placeholder="Website, LinkedIn, Instagram, etc."
          />
        </div>
        <div className="card span-2">
          <label className="card-title">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
        </div>
      </div>

      <div className="card span-2" style={{ marginTop: 20 }}>
        <label className="card-title">Skills & Expertise</label>
        <p className="card-hint">
          Be specific — "paid media for crypto" or "can produce a concert or festival" tells us more
          than a generic category. Search below, or add your own.
        </p>

        <div className="tag-combobox">
          <input
            type="text"
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="Search skills, occupations, industries…"
          />
          {tagQuery.trim() && (
            <div className="tag-combobox-dropdown">
              {filteredOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  className="tag-combobox-option"
                  onClick={() => addTag({ category: opt.category, label: opt.label })}
                >
                  <span>{opt.label}</span>
                  <span className="tag-combobox-option-category">
                    {CATEGORY_LABELS[opt.category] ?? opt.category}
                  </span>
                </button>
              ))}
              {!exactMatchExists && (
                <button
                  type="button"
                  className="tag-combobox-option tag-combobox-add"
                  onClick={() => addTag({ category: "skill", label: tagQuery.trim() })}
                >
                  Add "{tagQuery.trim()}" as a new skill
                </button>
              )}
              {filteredOptions.length === 0 && exactMatchExists && (
                <p className="tag-combobox-empty">Already in the list above.</p>
              )}
            </div>
          )}
        </div>

        {Object.entries(groupedSelected).map(([category, tags]) => (
          <div key={category} style={{ marginTop: 14 }}>
            <p className="card-hint" style={{ margin: "0 0 6px" }}>
              {CATEGORY_LABELS[category] ?? category}
            </p>
            <div className="chip-group">
              {tags.map((t) => (
                <button
                  type="button"
                  key={`${t.category}:${t.label}`}
                  className="chip selected"
                  onClick={() => removeTag(t)}
                  title="Remove"
                >
                  {t.label} ×
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {status === "error" && error && <p className="error-text">{error}</p>}
      {status === "saved" && <p className="section-sub">Saved.</p>}

      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={status === "saving"}
        style={{ marginTop: 20 }}
      >
        {status === "saving" ? "Saving…" : "Save Profile"}
      </button>
    </div>
  );
}
