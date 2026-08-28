import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

interface PublicQuestion {
  id: string;
  type: "multiple_choice" | "true_false";
  question: string;
  choices: string[];
}

interface SubmitResult {
  score: number;
  total: number;
  passed: boolean;
  rewardPending: boolean;
  alreadyRewarded: boolean;
}

export function Assessment({ session }: { session: Session }) {
  const [questions, setQuestions] = useState<PublicQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [paypalEmail, setPaypalEmail] = useState("");
  const [status, setStatus] = useState<"answering" | "submitting" | "error">("answering");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/get-assessment")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setQuestions(data.questions);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load the assessment. Please try again.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allAnswered = questions !== null && questions.every((q) => answers[q.id] !== undefined);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setStatus("submitting");
    setSubmitError(null);
    try {
      const res = await fetch("/api/submit-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ answers, paypalEmail: paypalEmail.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setSubmitError(data.error || "Something went wrong submitting your assessment.");
        return;
      }
      setResult(data);
    } catch {
      setStatus("error");
      setSubmitError("Something went wrong submitting your assessment. Please try again.");
    }
  };

  if (result) {
    return (
      <div className="form-section">
        <h2 style={{ fontSize: 20 }}>
          {result.passed ? "You passed! 🎉" : "Assessment complete"}
        </h2>
        <p className="section-sub">
          Score: {result.score} / {result.total}
        </p>
        {result.passed && result.rewardPending && (
          <p className="section-sub">
            Nice work — you've earned $5. We review and send PayPal payouts by hand, so expect it
            within a few business days.
          </p>
        )}
        {result.passed && result.alreadyRewarded && (
          <p className="section-sub">
            You've already been rewarded for a previous passing attempt, so this one doesn't
            qualify for an additional payout.
          </p>
        )}
        {!result.passed && (
          <p className="section-sub">
            You didn't hit the passing score this time. Feel free to review AI basics and try
            again later.
          </p>
        )}
      </div>
    );
  }

  if (loadError) {
    return <p className="error-text">{loadError}</p>;
  }

  if (!questions) {
    return <p className="section-sub">Loading assessment…</p>;
  }

  return (
    <div className="form-section">
      <h2 style={{ fontSize: 20 }}>AI Literacy Assessment</h2>
      <p className="section-sub">
        Answer all {questions.length} questions. Pass to earn $5, sent via PayPal.
      </p>

      <div className="quiz-list">
        {questions.map((q, i) => (
          <div key={q.id} className="quiz-question">
            <p className="quiz-question-text">
              {i + 1}. {q.question}
            </p>
            <div className="quiz-choices">
              {q.choices.map((choice, choiceIndex) => (
                <label
                  key={choiceIndex}
                  className={`quiz-choice ${answers[q.id] === choiceIndex ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === choiceIndex}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: choiceIndex }))}
                  />
                  {choice}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allAnswered && (
        <div className="quiz-paypal-field">
          <label htmlFor="paypalEmail">PayPal email (to send your $5 if you pass)</label>
          <input
            id="paypalEmail"
            type="email"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
      )}

      {status === "error" && submitError && <p className="error-text">{submitError}</p>}

      <button
        className="btn btn-primary"
        disabled={!allAnswered || !paypalEmail.trim() || status === "submitting"}
        onClick={handleSubmit}
        style={{ marginTop: 16 }}
      >
        {status === "submitting" ? "Submitting…" : "Submit Assessment"}
      </button>
    </div>
  );
}
