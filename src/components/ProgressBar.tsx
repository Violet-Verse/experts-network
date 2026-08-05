const STEP_LABELS = ["Expertise", "Experience", "Specializations", "Matching", "Review"];

export function ProgressBar({ step }: { step: number }) {
  return (
    <div>
      <div className="progress-track">
        {STEP_LABELS.map((_, i) => (
          <div className="progress-step" key={i}>
            <div
              className="fill"
              style={{ width: i <= step ? "100%" : "0%" }}
            />
          </div>
        ))}
      </div>
      <div className="progress-labels">
        {STEP_LABELS.map((label, i) => (
          <span key={label} className={i === step ? "active" : ""}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
