import { useState } from "react";
import type { FormEvent } from "react";
import type { ApplicationFormData } from "../types";
import { emptyFormData } from "../types";
import { validateApplication } from "../lib/validateApplication";
import { ExpertiseSection } from "./sections/ExpertiseSection";
import { NetworkFitSection } from "./sections/NetworkFitSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { SpecializationsSection } from "./sections/SpecializationsSection";
import { MatchingSection } from "./sections/MatchingSection";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function ApplicationForm() {
  const [data, setData] = useState<ApplicationFormData>(emptyFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = <K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateApplication(data);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitState("submitting");
    setSubmitError(null);
    try {
      const res = await fetch("/api/submit-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Submission failed (${res.status})`);
      }
      setSubmitState("success");
    } catch (err) {
      setSubmitState("error");
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (submitState === "success") {
    return (
      <div className="status-card">
        <div className="status-icon">💜</div>
        <h2>You're on the list!</h2>
        <p>
          Thanks for applying to the Experts Network, {data.fullName.split(" ")[0] || "friend"}. We'll
          review your application and reach out at {data.email} when there's a fit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <ExpertiseSection data={data} update={update} errors={errors} />
      <NetworkFitSection data={data} update={update} errors={errors} />
      <ExperienceSection data={data} update={update} />
      <SpecializationsSection data={data} update={update} />
      <MatchingSection data={data} update={update} errors={errors} />

      {Object.keys(errors).length > 0 && (
        <p className="error-text">Please fix the highlighted fields above.</p>
      )}
      {submitState === "error" && <p className="error-text">{submitError}</p>}

      <div className="form-nav">
        <button className="btn btn-primary" type="submit" disabled={submitState === "submitting"}>
          {submitState === "submitting" ? "Submitting…" : "Submit Application"}
        </button>
      </div>
    </form>
  );
}
