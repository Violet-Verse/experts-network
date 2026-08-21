import { useState } from "react";
import type { FormEvent } from "react";
import type { Step1Data, Step2Data } from "../types";
import { emptyStep1Data, emptyStep2Data } from "../types";
import { validateStep1, validateStep2 } from "../lib/validateApplication";
import type { Step1Errors, Step2Errors } from "../lib/validateApplication";
import { Step1Form } from "./Step1Form";
import { Step2Form } from "./Step2Form";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function ApplicationForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [step1Data, setStep1Data] = useState<Step1Data>(emptyStep1Data);
  const [step2Data, setStep2Data] = useState<Step2Data>(emptyStep2Data);
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
  const [step2Errors, setStep2Errors] = useState<Step2Errors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateStep1 = <K extends keyof Step1Data>(key: K, value: Step1Data[K]) => {
    setStep1Data((prev) => ({ ...prev, [key]: value }));
  };

  const updateStep2 = <K extends keyof Step2Data>(key: K, value: Step2Data[K]) => {
    setStep2Data((prev) => ({ ...prev, [key]: value }));
  };

  const handleStep1Submit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateStep1(step1Data);
    setStep1Errors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitState("submitting");
    setSubmitError(null);
    try {
      const res = await fetch("/api/submit-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(step1Data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || `Submission failed (${res.status})`);
      }
      setApplicationId(body.id);
      setSubmitState("idle");
      setStep(2);
    } catch (err) {
      setSubmitState("error");
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const handleStep2Submit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateStep2(step2Data);
    setStep2Errors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitState("submitting");
    setSubmitError(null);
    try {
      const res = await fetch("/api/update-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: applicationId, ...step2Data }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
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
          Thanks for applying to Verso Network, {step1Data.fullName.split(" ")[0] || "friend"}. We'll
          review your application and reach out at {step1Data.email} when there's a fit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={step === 1 ? handleStep1Submit : handleStep2Submit}>
      <p className="step-indicator">Step {step} of 2</p>

      {step === 1 ? (
        <Step1Form data={step1Data} update={updateStep1} errors={step1Errors} />
      ) : (
        <Step2Form data={step2Data} update={updateStep2} errors={step2Errors} />
      )}

      {submitState === "error" && <p className="error-text">{submitError}</p>}

      <div className="form-nav">
        <button className="btn btn-primary" type="submit" disabled={submitState === "submitting"}>
          {submitState === "submitting"
            ? "Saving…"
            : step === 1
              ? "Continue"
              : "Submit Application"}
        </button>
      </div>
    </form>
  );
}
