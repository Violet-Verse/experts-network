import type { ApplicationFormData } from "../../types";
import { LONG_TERM_OPTIONS, REMOTE_OPTIONS, TIME_ZONE_OPTIONS } from "../../formConfig";
import { Card, PillGroup, SelectField } from "../fields";

export function MatchingSection({
  data,
  update,
  errors,
}: {
  data: ApplicationFormData;
  update: <K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) => void;
  errors: Partial<Record<keyof ApplicationFormData, string>>;
}) {
  return (
    <>
      <div className="form-section">
        <h2>Matching</h2>
        <p className="section-sub">Help us find the right fit for you.</p>
      </div>

      <div className="card-grid">
        <Card icon="✨" title="What kinds of projects excite you?" span2>
          <textarea rows={3} value={data.excitingProjects} onChange={(e) => update("excitingProjects", e.target.value)} />
        </Card>

        <Card icon="🧭" title="What industries do you know deeply?" span2>
          <textarea rows={3} value={data.deepIndustries} onChange={(e) => update("deepIndustries", e.target.value)} />
        </Card>

        <Card icon="🤝" title="Interested in long-term collaborations?">
          <PillGroup options={LONG_TERM_OPTIONS} value={data.longTermInterest} onChange={(v) => update("longTermInterest", v)} />
        </Card>

        <Card icon="🌐" title="Remote only?">
          <PillGroup options={REMOTE_OPTIONS} value={data.remoteOnly} onChange={(v) => update("remoteOnly", v)} />
        </Card>

        <Card icon="🕒" title="Time zone">
          <SelectField
            value={data.timeZone}
            onChange={(v) => update("timeZone", v)}
            options={TIME_ZONE_OPTIONS}
            placeholder="Select your time zone…"
          />
        </Card>

        <Card icon="📅" title="Earliest availability">
          <input
            type="date"
            value={data.earliestAvailability}
            onChange={(e) => update("earliestAvailability", e.target.value)}
          />
        </Card>
      </div>

      <div className="form-section">
        <h2 style={{ fontSize: 20 }}>How to reach you</h2>
      </div>

      <div className="card-grid">
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
