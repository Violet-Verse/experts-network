import type { ApplicationFormData } from "../types";
import {
  PRIMARY_ROLES,
  EXPERTISE_AREA_OPTIONS,
  PROJECT_TYPES,
  INDUSTRY_OPTIONS,
  CONTRACT_LENGTHS,
  COMPENSATION_TYPES,
} from "../formConfig";
import { Card, ChipGroup } from "./fields";

function wordCount(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

export function StepPart1({
  data,
  update,
}: {
  data: ApplicationFormData;
  update: <K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) => void;
}) {
  const bioWords = wordCount(data.bio);
  const bioOutOfRange = data.bio.length > 0 && (bioWords < 100 || bioWords > 150);

  return (
    <>
      <div className="form-section">
        <h2>Part 1: Tell Us About Your Expertise</h2>
        <p className="section-sub">
          Help us understand your background so we can match you with future paid research, AI
          evaluation, and content opportunities.
        </p>
      </div>

      <div className="card-grid">
        <Card icon="👤" title="One primary role" hint="Writer, researcher, evaluator, engineer, product marketer, designer, strategist, etc.">
          <select value={data.primaryRole} onChange={(e) => update("primaryRole", e.target.value)}>
            <option value="">Select a role…</option>
            {PRIMARY_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </Card>

        <Card icon="⭐" title="Three areas of expertise" hint="Choose the topics you're most confident contributing to.">
          <ChipGroup
            options={EXPERTISE_AREA_OPTIONS}
            selected={data.expertiseAreas}
            max={3}
            onToggle={(val) => {
              const has = data.expertiseAreas.includes(val);
              update(
                "expertiseAreas",
                has ? data.expertiseAreas.filter((v) => v !== val) : [...data.expertiseAreas, val]
              );
            }}
          />
          <span className="word-count">{data.expertiseAreas.length} / 3 selected</span>
        </Card>

        <Card icon="📝" title="One short bio" hint="Tell us about your experience in 100–150 words." span2>
          <textarea
            value={data.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={5}
            placeholder="I'm a…"
          />
          <span className={`word-count${bioOutOfRange ? " warn" : ""}`}>{bioWords} words (100–150)</span>
        </Card>

        <Card icon="🔗" title="Portfolio" hint="Share your best work, LinkedIn, GitHub, website, or writing samples." span2>
          <textarea
            value={data.portfolioLinks}
            onChange={(e) => update("portfolioLinks", e.target.value)}
            rows={2}
            placeholder="https://linkedin.com/in/..., https://github.com/..., https://..."
          />
        </Card>
      </div>

      <div className="form-section">
        <h2 style={{ fontSize: 20 }}>Network Fit</h2>
      </div>

      <div className="card-grid">
        <Card icon="💼" title="Preferred project types" span2>
          <ChipGroup
            options={PROJECT_TYPES}
            selected={data.preferredProjectTypes}
            onToggle={(val) => {
              const has = data.preferredProjectTypes.includes(val);
              update(
                "preferredProjectTypes",
                has
                  ? data.preferredProjectTypes.filter((v) => v !== val)
                  : [...data.preferredProjectTypes, val]
              );
            }}
          />
        </Card>

        <Card icon="🌍" title="Primary industries" hint="Fintech, AI, Crypto, Fashion, Beauty, Travel, Media, Healthcare, etc." span2>
          <ChipGroup
            options={INDUSTRY_OPTIONS}
            selected={data.primaryIndustries}
            onToggle={(val) => {
              const has = data.primaryIndustries.includes(val);
              update(
                "primaryIndustries",
                has ? data.primaryIndustries.filter((v) => v !== val) : [...data.primaryIndustries, val]
              );
            }}
          />
        </Card>

        <Card icon="⏰" title="Availability" hint="Hours per week and preferred contract length.">
          <input
            type="number"
            min={0}
            max={80}
            placeholder="Hours / week"
            value={data.hoursPerWeek}
            onChange={(e) => update("hoursPerWeek", e.target.value)}
          />
          <select
            value={data.preferredContractLength}
            onChange={(e) => update("preferredContractLength", e.target.value)}
          >
            <option value="">Preferred contract length…</option>
            {CONTRACT_LENGTHS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Card>

        <Card icon="💰" title="Compensation expectations" hint="Hourly, project-based, or flexible.">
          <select value={data.compensationType} onChange={(e) => update("compensationType", e.target.value)}>
            <option value="">Select type…</option>
            {COMPENSATION_TYPES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="e.g. $75/hr, or open to discussing"
            value={data.compensationDetails}
            onChange={(e) => update("compensationDetails", e.target.value)}
          />
        </Card>

        <Card icon="🚀" title="Future opportunities" hint="Tell us which kinds of projects you'd love to work on next." span2>
          <textarea
            rows={3}
            value={data.futureOpportunities}
            onChange={(e) => update("futureOpportunities", e.target.value)}
          />
        </Card>
      </div>
    </>
  );
}
