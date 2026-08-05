import { useState } from "react";
import { ProgressBar } from "./components/ProgressBar";
import { StepPart1 } from "./components/StepPart1";
import { StepPart2 } from "./components/StepPart2";
import { StepPart3 } from "./components/StepPart3";
import { StepPart4 } from "./components/StepPart4";
import { ReviewStep } from "./components/ReviewStep";
import { emptyFormData, type ApplicationFormData } from "./types";

type SubmitState = "idle" | "submitting" | "success" | "error";

function wordCount(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

function validateStep(step: number, data: ApplicationFormData): string | null {
  if (step === 0) {
    if (!data.primaryRole) return "Please select a primary role.";
    if (data.expertiseAreas.length !== 3) return "Please choose exactly 3 areas of expertise.";
    const words = wordCount(data.bio);
    if (words < 100 || words > 150) return "Your bio should be 100–150 words.";
    if (!data.portfolioLinks.trim()) return "Please share at least one portfolio link.";
    if (data.preferredProjectTypes.length === 0) return "Please select at least one preferred project type.";
    if (data.primaryIndustries.length === 0) return "Please select at least one primary industry.";
  }
  if (step === 3) {
    if (!data.fullName.trim()) return "Please enter your full name.";
    if (!data.email.trim() || !data.email.includes("@")) return "Please enter a valid email address.";
  }
  return null;
}

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ApplicationFormData>(emptyFormData);
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = <K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const goNext = () => {
    const validationError = validateStep(step, data);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
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
      <div className="app-shell">
        <div className="status-card">
          <div className="status-icon">💜</div>
          <h2>You're on the list!</h2>
          <p>
            Thanks for applying to the Experts Network, {data.fullName.split(" ")[0] || "friend"}. We'll
            review your application and reach out at {data.email} when there's a fit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="eyebrow">Experts Network</span>
        <h1>Join the Experts Network</h1>
        <p>
          Tell us about your background so we can match you with future paid research, AI
          evaluation, and content opportunities.
        </p>
      </header>

      <ProgressBar step={step} />

      {step === 0 && <StepPart1 data={data} update={update} />}
      {step === 1 && <StepPart2 data={data} update={update} />}
      {step === 2 && <StepPart3 data={data} update={update} />}
      {step === 3 && <StepPart4 data={data} update={update} />}
      {step === 4 && <ReviewStep data={data} />}

      {error && <p className="error-text">{error}</p>}
      {submitState === "error" && <p className="error-text">{submitError}</p>}

      <div className="form-nav">
        <button className="btn btn-secondary" onClick={goBack} disabled={step === 0 || submitState === "submitting"}>
          Back
        </button>
        {step < 4 ? (
          <button className="btn btn-primary" onClick={goNext}>
            Continue
          </button>
        ) : (
          <button className="btn btn-primary" onClick={submit} disabled={submitState === "submitting"}>
            {submitState === "submitting" ? "Submitting…" : "Submit Application"}
          </button>
        )}
      </div>
    </div>
  );
}
