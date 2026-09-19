import { useState } from "react";
import type { Session } from "@supabase/supabase-js";

const SOURCE_OPTIONS = ["verso", "handshake", "mercor", "ethos", "xai", "linkedin", "other"];
const TYPE_OPTIONS = ["job", "training", "project", "grant"];

export function AdminAddOpportunity({ session }: { session: Session }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("job");
  const [source, setSource] = useState("verso");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setCompany("");
    setUrl("");
    setTags("");
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setStatus("error");
      setError("Title is required.");
      return;
    }
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/add-opportunity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title, company, url, type, source, tags, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Something went wrong adding that opportunity.");
        return;
      }
      setStatus("saved");
      reset();
    } catch {
      setStatus("error");
      setError("Something went wrong adding that opportunity. Please try again.");
    }
  };

  return (
    <div className="form-section">
      <h2 style={{ fontSize: 20 }}>Add Opportunity</h2>
      <p className="section-sub">
        Manually curated listings — Mercor, Ethos, xAI, LinkedIn AI-trainer roles, copied Handshake
        postings, or Verso's own. No automated sourcing here on purpose.
      </p>

      <div className="card-grid">
        <div className="card span-2">
          <label className="card-title">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="card">
          <label className="card-title">Company</label>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div className="card">
          <label className="card-title">Link</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https:// (e.g. your Mercor referral link)"
          />
        </div>
        <div className="card">
          <label className="card-title">Source</label>
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="card">
          <label className="card-title">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="card span-2">
          <label className="card-title">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma-separated, matched against member skills for the match badge"
          />
        </div>
        <div className="card span-2">
          <label className="card-title">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </div>
      </div>

      {status === "error" && error && <p className="error-text">{error}</p>}
      {status === "saved" && <p className="section-sub">Added.</p>}

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={status === "saving"}
        style={{ marginTop: 16 }}
      >
        {status === "saving" ? "Adding…" : "Add Opportunity"}
      </button>
    </div>
  );
}
