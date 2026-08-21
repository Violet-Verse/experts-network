import type { Step1Data } from "../types";
import type { Step1Errors } from "../lib/validateApplication";
import { Card } from "./fields";

export function Step1Form({
  data,
  update,
  errors,
}: {
  data: Step1Data;
  update: <K extends keyof Step1Data>(key: K, value: Step1Data[K]) => void;
  errors: Step1Errors;
}) {
  return (
    <>
      <div className="form-section">
        <h2>Get Started</h2>
        <p className="section-sub">Tell us who you are — we'll follow up with a few more questions next.</p>
      </div>

      <div className="card-grid">
        <Card icon="🔗" title="LinkedIn URL" hint="Share a link to your LinkedIn profile." span2>
          <input
            type="text"
            value={data.linkedinUrl}
            onChange={(e) => update("linkedinUrl", e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
          {errors.linkedinUrl && <p className="error-text">{errors.linkedinUrl}</p>}
        </Card>

        <Card icon="🙋" title="Full name">
          <input type="text" value={data.fullName} onChange={(e) => update("fullName", e.target.value)} />
          {errors.fullName && <p className="error-text">{errors.fullName}</p>}
        </Card>

        <Card icon="✉️" title="Email">
          <input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </Card>
      </div>
    </>
  );
}
